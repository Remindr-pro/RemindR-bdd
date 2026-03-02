import crypto from "node:crypto";
import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { hashPassword, comparePassword } from "../utils/bcrypt";
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { AuthRequest } from "../middleware/auth";
import { UserType } from "@prisma/client";
import { PassportUser } from "../config/passport";
import { webhookService } from "../services/webhook.service";
import { notificationService } from "../services/notification.service";
import { oauth2Config } from "../config/jwt";
import jwt from "jsonwebtoken";
import passport from "../config/passport";
import { getAppleUserInfo } from "../utils/appleAuth";

export class AuthController {
  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth,
        genderBirth,
        genderActual,
        familyId,
        userType,
      } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: "User with this email already exists",
        });
        return;
      }

      if (familyId) {
        const familyExists = await prisma.family.findUnique({
          where: { id: familyId },
        });
        if (!familyExists) {
          res.status(400).json({
            success: false,
            message: "Family ID does not exist",
          });
          return;
        }
      }

      const passwordHash = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          phoneNumber: phoneNumber || null,
          dateOfBirth: new Date(dateOfBirth),
          genderBirth: genderBirth || null,
          genderActual: genderActual || null,
          familyId: familyId || null,
          userType: userType || UserType.INDIVIDUAL,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          userType: true,
          familyId: true,
          profileCompleted: true,
        },
      });

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        userType: user.userType,
        familyId: user.familyId,
      });

      const refreshToken = generateRefreshToken({
        id: user.id,
        email: user.email,
        role: user.role,
        userType: user.userType,
        familyId: user.familyId,
      });

      await webhookService.triggerWebhook("user.created", {
        userId: user.id,
        email: user.email,
        userType: user.userType,
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user,
          token,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      if (!user.passwordHash || user.passwordHash === "") {
        res.status(401).json({
          success: false,
          message:
            "This account uses social login. Please sign in with Google or Apple.",
        });
        return;
      }

      const isValidPassword = await comparePassword(
        password,
        user.passwordHash,
      );

      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        userType: user.userType,
        familyId: user.familyId,
      });

      const refreshToken = generateRefreshToken({
        id: user.id,
        email: user.email,
        role: user.role,
        userType: user.userType,
        familyId: user.familyId,
      });

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            userType: user.userType,
            familyId: user.familyId,
            profileCompleted: user.profileCompleted,
          },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: "Refresh token is required",
        });
        return;
      }

      const decoded = verifyRefreshToken(refreshToken);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          userType: true,
          familyId: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
        return;
      }

      const newToken = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        userType: user.userType,
        familyId: user.familyId,
      });

      const newRefreshToken = generateRefreshToken({
        id: user.id,
        email: user.email,
        role: user.role,
        userType: user.userType,
        familyId: user.familyId,
      });

      res.json({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch {
      res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
      return;
    }
  }

  async logout(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);

        try {
          const decoded = jwt.decode(token) as { exp?: number } | null;

          if (decoded && decoded.exp) {
            const expiresAt = new Date(decoded.exp * 1000);

            try {
              await prisma.tokenBlacklist.create({
                data: {
                  token,
                  expiresAt,
                },
              });
            } catch {
              // TokenBlacklist table might not exist yet, ignore
            }
          }
        } catch {
          // Ignore token decode errors
        }
      }

      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          dateOfBirth: true,
          genderBirth: true,
          genderActual: true,
          role: true,
          userType: true,
          profilePictureUrl: true,
          profileCompleted: true,
          familyId: true,
          createdAt: true,
        },
      });

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email } = req.body;
      const emailStr =
        typeof email === "string" ? email.trim().toLowerCase() : "";

      if (!emailStr) {
        res.status(400).json({
          success: false,
          message: "Email is required",
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email: emailStr },
      });

      if (!user || !user.passwordHash || user.passwordHash === "") {
        res.json({
          success: true,
          message:
            "If an account exists with this email, you will receive a password reset link.",
        });
        return;
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      const frontendUrl = process.env.FRONTEND_URL || "https://remind-r.com";
      const resetLink = `${frontendUrl}/connexion/reinitialiser-mot-de-passe?token=${token}`;

      await notificationService.sendEmail({
        userId: user.id,
        email: user.email,
        notificationType: "email",
        title: "Réinitialisation de votre mot de passe - RemindR",
        message: `Bonjour ${user.firstName},\n\nVous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :\n\n${resetLink}\n\nCe lien expire dans 1 heure.\n\nSi vous n'avez pas fait cette demande, ignorez cet email.\n\nL'équipe RemindR`,
      });

      res.json({
        success: true,
        message:
          "If an account exists with this email, you will receive a password reset link.",
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || typeof token !== "string") {
        res.status(400).json({
          success: false,
          message: "Token is required",
        });
        return;
      }

      if (
        !newPassword ||
        typeof newPassword !== "string" ||
        newPassword.length < 8
      ) {
        res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters",
        });
        return;
      }

      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!resetToken || resetToken.expiresAt < new Date()) {
        res.status(400).json({
          success: false,
          message: "Invalid or expired reset token",
        });
        return;
      }

      const passwordHash = await hashPassword(newPassword);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: resetToken.userId },
          data: { passwordHash },
        }),
        prisma.passwordResetToken.delete({
          where: { id: resetToken.id },
        }),
      ]);

      res.json({
        success: true,
        message:
          "Password has been reset successfully. You can now log in with your new password.",
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyPassword(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { currentPassword } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          passwordHash: true,
        },
      });

      if (!user || !user.passwordHash || user.passwordHash === "") {
        res.status(400).json({
          success: false,
          message: "Password verification is not available for this account",
        });
        return;
      }

      const isValidPassword = await comparePassword(
        currentPassword,
        user.passwordHash,
      );

      if (!isValidPassword) {
        res.status(400).json({
          success: false,
          message: "L'ancien mot de passe est incorrect",
        });
        return;
      }

      res.json({
        success: true,
        message: "Password verified successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          passwordHash: true,
        },
      });

      if (!user || !user.passwordHash || user.passwordHash === "") {
        res.status(400).json({
          success: false,
          message: "Password change is not available for this account",
        });
        return;
      }

      const isValidPassword = await comparePassword(
        currentPassword,
        user.passwordHash,
      );

      if (!isValidPassword) {
        res.status(400).json({
          success: false,
          message: "L'ancien mot de passe est incorrect",
        });
        return;
      }

      const isSamePassword = await comparePassword(newPassword, user.passwordHash);
      if (isSamePassword) {
        res.status(400).json({
          success: false,
          message: "New password must be different from current password",
        });
        return;
      }

      const passwordHash = await hashPassword(newPassword);

      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      res.json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async activateAccount(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { token } = req.body;

      if (!token || typeof token !== "string") {
        res.status(400).json({
          success: false,
          message: "Token is required",
        });
        return;
      }

      const activationToken = await prisma.activationToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!activationToken || activationToken.expiresAt < new Date()) {
        res.status(400).json({
          success: false,
          message: "Invalid or expired activation token",
        });
        return;
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { id: activationToken.userId },
          data: { isActive: true },
        }),
        prisma.activationToken.delete({
          where: { id: activationToken.id },
        }),
      ]);

      res.json({
        success: true,
        message: "Account activated successfully. You can now log in.",
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyIdentity(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { memberNumber, dateOfBirth, email } = req.body;

      if (!memberNumber || !dateOfBirth || !email) {
        res.status(400).json({
          success: false,
          message: "memberNumber, dateOfBirth and email are required",
        });
        return;
      }

      const user = await prisma.user.findFirst({
        where: {
          email,
          memberNumber,
          dateOfBirth: new Date(dateOfBirth),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          familyId: true,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message:
            "No account found matching the provided credentials. Please check your member number, date of birth and email.",
        });
        return;
      }

      res.json({
        success: true,
        message: "Identity verified successfully",
        data: {
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          familyId: user.familyId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async resendActivation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email } = req.body;
      const emailStr =
        typeof email === "string" ? email.trim().toLowerCase() : "";

      if (!emailStr) {
        res.status(400).json({
          success: false,
          message: "Email is required",
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email: emailStr },
      });

      if (!user) {
        res.json({
          success: true,
          message:
            "If an account exists with this email, you will receive an activation link.",
        });
        return;
      }

      if (user.isActive) {
        res.json({
          success: true,
          message: "Account is already activated. You can log in.",
        });
        return;
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.activationToken.deleteMany({
        where: { userId: user.id },
      });

      await prisma.activationToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      const frontendUrl = process.env.FRONTEND_URL || "https://remind-r.com";
      const activationLink = `${frontendUrl}/bienvenue/activer?token=${token}`;

      await notificationService.sendEmail({
        userId: user.id,
        email: user.email,
        notificationType: "email",
        title: "Activez votre compte RemindR",
        message: `Bonjour ${user.firstName},\n\nCliquez sur le lien ci-dessous pour activer votre compte :\n\n${activationLink}\n\nCe lien expire dans 24 heures.\n\nL'équipe RemindR`,
      });

      res.json({
        success: true,
        message:
          "If an account exists with this email, you will receive an activation link.",
      });
    } catch (error) {
      next(error);
    }
  }

  async patchMe(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { profileCompleted } = req.body;

      if (typeof profileCompleted !== "boolean") {
        res.status(400).json({
          success: false,
          message: "profileCompleted must be a boolean",
        });
        return;
      }

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { profileCompleted },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          profileCompleted: true,
        },
      });

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async googleAuth(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!oauth2Config.google.clientId || !oauth2Config.google.clientSecret) {
        res.status(503).json({
          success: false,
          message: "Google OAuth2 is not configured",
        });
        return;
      }

      passport.authenticate("google", {
        scope: ["profile", "email"],
        state: (req.query.redirect_uri as string) || undefined,
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  async googleCallback(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!oauth2Config.google.clientId || !oauth2Config.google.clientSecret) {
        res.status(503).json({
          success: false,
          message: "Google OAuth2 is not configured",
        });
        return;
      }

      passport.authenticate(
        "google",
        { session: false },
        async (err: Error | null, passportUser: PassportUser | undefined) => {
          if (err || !passportUser) {
            res.status(401).json({
              success: false,
              message: "Google authentication failed",
            });
            return;
          }

          const user = passportUser;

          if (!user.isActive) {
            res.status(403).json({
              success: false,
              message: "User account is inactive",
            });
            return;
          }

          const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
            userType: user.userType,
            familyId: user.familyId,
          });

          const refreshToken = generateRefreshToken({
            id: user.id,
            email: user.email,
            role: user.role,
            userType: user.userType,
            familyId: user.familyId,
          });

          const redirectUri =
            (req.query.state as string) ||
            process.env.FRONTEND_URL ||
            "http://localhost:3000";
          const separator = redirectUri.includes("?") ? "&" : "?";
          res.redirect(
            `${redirectUri}${separator}token=${token}&refreshToken=${refreshToken}`,
          );
        },
      )(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  async appleAuth(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      if (!oauth2Config.apple.clientId) {
        res.status(503).json({
          success: false,
          message: "Apple OAuth2 is not configured",
        });
        return;
      }

      const redirectUri = encodeURIComponent(oauth2Config.apple.redirectUri);
      const clientId = oauth2Config.apple.clientId;
      const state = (req.query.redirect_uri as string) || "";
      const appleAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20name&response_mode=form_post&state=${encodeURIComponent(state)}`;

      res.redirect(appleAuthUrl);
    } catch {
      res.status(500).json({
        success: false,
        message: "Failed to initiate Apple authentication",
      });
    }
  }

  async appleCallback(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!oauth2Config.apple.clientId) {
        res.status(503).json({
          success: false,
          message: "Apple OAuth2 is not configured",
        });
        return;
      }

      const { code, user: userInfoString } = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          message: "Authorization code is required",
        });
        return;
      }

      const appleUserInfo = await getAppleUserInfo(code);

      const email = appleUserInfo.email;
      let firstName = "User";
      let lastName = "";

      if (userInfoString) {
        try {
          const userInfo = JSON.parse(userInfoString);
          firstName = userInfo.name?.firstName || firstName;
          lastName = userInfo.name?.lastName || lastName;
        } catch {
          // Ignore parsing errors
        }
      }

      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email not provided by Apple",
        });
        return;
      }

      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            passwordHash: "",
            firstName,
            lastName,
            dateOfBirth: new Date("1990-01-01"),
            userType: UserType.INDIVIDUAL,
          },
        });
      }

      if (!user.isActive) {
        res.status(403).json({
          success: false,
          message: "User account is inactive",
        });
        return;
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        userType: user.userType,
        familyId: user.familyId,
      });

      const refreshToken = generateRefreshToken({
        id: user.id,
        email: user.email,
        role: user.role,
        userType: user.userType,
        familyId: user.familyId,
      });

      const redirectUri =
        req.body.state || process.env.FRONTEND_URL || "http://localhost:3000";
      const separator = redirectUri.includes("?") ? "&" : "?";
      res.redirect(
        `${redirectUri}${separator}token=${token}&refreshToken=${refreshToken}`,
      );
    } catch (error) {
      next(error);
    }
  }
}
