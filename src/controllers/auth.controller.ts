import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';
import { UserType } from '@prisma/client';
import { PassportUser } from '../config/passport';
import { webhookService } from '../services/webhook.service';
import { oauth2Config } from '../config/jwt';
import jwt from 'jsonwebtoken';
import passport from '../config/passport';
import { getAppleUserInfo } from '../utils/appleAuth';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName, phoneNumber, dateOfBirth, genderBirth, genderActual, familyId, userType } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'User with this email already exists',
        });
        return;
      }

      const passwordHash = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          phoneNumber,
          dateOfBirth: new Date(dateOfBirth),
          genderBirth,
          genderActual,
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

      await webhookService.triggerWebhook('user.created', {
        userId: user.id,
        email: user.email,
        userType: user.userType,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
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
          message: 'Invalid credentials',
        });
        return;
      }

      const isValidPassword = await comparePassword(password, user.passwordHash);

      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
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
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            userType: user.userType,
            familyId: user.familyId,
          },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required',
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
          message: 'Invalid refresh token',
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
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return;
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
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
            } catch (error) {
              // TokenBlacklist table might not exist yet, ignore
            }
          }
        } catch (error) {
          // Ignore token decode errors
        }
      }

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
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

  async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!oauth2Config.google.clientId || !oauth2Config.google.clientSecret) {
        res.status(503).json({
          success: false,
          message: 'Google OAuth2 is not configured',
        });
        return;
      }

      passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: req.query.redirect_uri as string || undefined,
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!oauth2Config.google.clientId || !oauth2Config.google.clientSecret) {
        res.status(503).json({
          success: false,
          message: 'Google OAuth2 is not configured',
        });
        return;
      }

      passport.authenticate('google', { session: false }, async (err: Error | null, passportUser: PassportUser | undefined) => {
        if (err || !passportUser) {
          res.status(401).json({
            success: false,
            message: 'Google authentication failed',
          });
          return;
        }

        const user = passportUser;

        if (!user.isActive) {
          res.status(403).json({
            success: false,
            message: 'User account is inactive',
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

        const redirectUri = req.query.state as string || process.env.FRONTEND_URL || 'http://localhost:3000';
        const separator = redirectUri.includes('?') ? '&' : '?';
        res.redirect(`${redirectUri}${separator}token=${token}&refreshToken=${refreshToken}`);
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  async appleAuth(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      if (!oauth2Config.apple.clientId) {
        res.status(503).json({
          success: false,
          message: 'Apple OAuth2 is not configured',
        });
        return;
      }

      const redirectUri = encodeURIComponent(oauth2Config.apple.redirectUri);
      const clientId = oauth2Config.apple.clientId;
      const state = req.query.redirect_uri as string || '';
      const appleAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20name&response_mode=form_post&state=${encodeURIComponent(state)}`;

      res.redirect(appleAuthUrl);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to initiate Apple authentication',
      });
    }
  }

  async appleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!oauth2Config.apple.clientId) {
        res.status(503).json({
          success: false,
          message: 'Apple OAuth2 is not configured',
        });
        return;
      }

      const { code, user: userInfoString } = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          message: 'Authorization code is required',
        });
        return;
      }

      const appleUserInfo = await getAppleUserInfo(code);

      const email = appleUserInfo.email;
      let firstName = 'User';
      let lastName = '';

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
          message: 'Email not provided by Apple',
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
            passwordHash: '',
            firstName,
            lastName,
            dateOfBirth: new Date('1990-01-01'),
            userType: UserType.INDIVIDUAL,
          },
        });
      }

      if (!user.isActive) {
        res.status(403).json({
          success: false,
          message: 'User account is inactive',
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

      const redirectUri = req.body.state || process.env.FRONTEND_URL || 'http://localhost:3000';
      const separator = redirectUri.includes('?') ? '&' : '?';
      res.redirect(`${redirectUri}${separator}token=${token}&refreshToken=${refreshToken}`);
    } catch (error) {
      next(error);
    }
  }
}

