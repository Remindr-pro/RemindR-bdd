import { Response, NextFunction } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth";
import { Prisma, UserType } from "@prisma/client";
import { hashPassword } from "../utils/bcrypt";
import crypto from "node:crypto";

export class FamilyController {
  async deleteMember(
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

      if (!req.user.familyId) {
        res.status(400).json({
          success: false,
          message: "Current user is not associated with a family",
        });
        return;
      }

      const { memberId } = req.params;
      const memberIdStr = Array.isArray(memberId) ? memberId[0] : memberId;

      const member = await prisma.user.findUnique({
        where: { id: memberIdStr },
        select: {
          id: true,
          familyId: true,
          email: true,
          isActive: true,
        },
      });

      if (!member || !member.isActive) {
        res.status(404).json({
          success: false,
          message: "Family member not found",
        });
        return;
      }

      if (member.familyId !== req.user.familyId) {
        res.status(403).json({
          success: false,
          message: "Access denied: member is not in your family",
        });
        return;
      }

      if (member.id === req.user.id) {
        res.status(400).json({
          success: false,
          message: "You cannot delete your own profile from this endpoint",
        });
        return;
      }

      const isSimpleProfile = member.email.toLowerCase().endsWith("@remindr.local");
      if (!isSimpleProfile) {
        res.status(400).json({
          success: false,
          message:
            "Connected members cannot be deleted from this screen. Disable account access first if needed.",
        });
        return;
      }

      await prisma.user.delete({
        where: { id: memberIdStr },
      });

      res.json({
        success: true,
        message: "Family member deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async createMember(
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

      const {
        firstName,
        lastName,
        dateOfBirth,
        genderBirth,
        genderActual,
        profilePictureUrl,
        profileLink,
        profileColor,
        email,
        createLogin,
        password,
      } = req.body;

      if (!firstName || !lastName || !dateOfBirth) {
        res.status(400).json({
          success: false,
          message: "firstName, lastName and dateOfBirth are required",
        });
        return;
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          familyId: true,
          firstName: true,
          lastName: true,
        },
      });

      if (!currentUser) {
        res.status(404).json({
          success: false,
          message: "Current user not found",
        });
        return;
      }

      let familyId = currentUser.familyId;

      if (!familyId) {
        const newFamily = await prisma.family.create({
          data: {
            familyName:
              `${currentUser.firstName} ${currentUser.lastName}`.trim() ||
              "Ma famille",
          },
          select: { id: true },
        });

        familyId = newFamily.id;

        await prisma.user.update({
          where: { id: currentUser.id },
          data: { familyId },
        });
      }

      const normalizedProfileLink =
        typeof profileLink === "string" ? profileLink.trim().toLowerCase() : "";
      const allowConnectedAccount =
        normalizedProfileLink !== "" &&
        normalizedProfileLink !== "moi" &&
        createLogin === true;

      let memberEmail = `family-member-${crypto.randomUUID()}@remindr.local`;
      let memberPassword = crypto.randomBytes(24).toString("hex");

      if (allowConnectedAccount) {
        if (!email || typeof email !== "string") {
          res.status(400).json({
            success: false,
            message: "Email is required when creating a connected account",
          });
          return;
        }
        if (!password || typeof password !== "string" || password.length < 8) {
          res.status(400).json({
            success: false,
            message:
              "Password is required (at least 8 characters) for a connected account",
          });
          return;
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          select: { id: true },
        });

        if (existingUser) {
          res.status(409).json({
            success: false,
            message: "User with this email already exists",
          });
          return;
        }

        memberEmail = normalizedEmail;
        memberPassword = password;
      }

      const passwordHash = await hashPassword(memberPassword);

      const member = await prisma.user.create({
        data: {
          familyId,
          email: memberEmail,
          passwordHash,
          firstName: String(firstName).trim(),
          lastName: String(lastName).trim(),
          dateOfBirth: new Date(dateOfBirth),
          genderBirth: genderBirth || null,
          genderActual: genderActual || null,
          profilePictureUrl: profilePictureUrl || null,
          profileLink: normalizedProfileLink || null,
          profileColor: profileColor || null,
          role: "family_member",
          userType: UserType.INDIVIDUAL,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          genderBirth: true,
          genderActual: true,
          profilePictureUrl: true,
          profileLink: true,
          profileColor: true,
          role: true,
          isActive: true,
          familyId: true,
        },
      });

      res.status(201).json({
        success: true,
        message: "Family member created successfully",
        data: {
          member,
          account: allowConnectedAccount
            ? {
                email: memberEmail,
              }
            : null,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMember(
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

      if (!req.user.familyId) {
        res.status(400).json({
          success: false,
          message: "Current user is not associated with a family",
        });
        return;
      }

      const { memberId } = req.params;
      const memberIdStr = Array.isArray(memberId) ? memberId[0] : memberId;

      const member = await prisma.user.findUnique({
        where: { id: memberIdStr },
        select: {
          id: true,
          familyId: true,
          isActive: true,
        },
      });

      if (!member || !member.isActive) {
        res.status(404).json({
          success: false,
          message: "Family member not found",
        });
        return;
      }

      if (member.familyId !== req.user.familyId) {
        res.status(403).json({
          success: false,
          message: "Access denied: member is not in your family",
        });
        return;
      }

      const {
        firstName,
        lastName,
        dateOfBirth,
        genderBirth,
        genderActual,
        profilePictureUrl,
        profileLink,
        profileColor,
      } = req.body;

      const updateData: Prisma.UserUpdateInput = {
        ...(firstName !== undefined ? { firstName: String(firstName).trim() } : {}),
        ...(lastName !== undefined ? { lastName: String(lastName).trim() } : {}),
        ...(dateOfBirth !== undefined ? { dateOfBirth: new Date(dateOfBirth) } : {}),
        ...(genderBirth !== undefined ? { genderBirth: genderBirth || null } : {}),
        ...(genderActual !== undefined ? { genderActual: genderActual || null } : {}),
        ...(profilePictureUrl !== undefined
          ? { profilePictureUrl: profilePictureUrl || null }
          : {}),
        ...(profileLink !== undefined ? { profileLink: profileLink || null } : {}),
        ...(profileColor !== undefined ? { profileColor: profileColor || null } : {}),
      };

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          success: false,
          message: "No valid field provided",
        });
        return;
      }

      const updatedMember = await prisma.user.update({
        where: { id: memberIdStr },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          genderBirth: true,
          genderActual: true,
          profilePictureUrl: true,
          profileLink: true,
          profileColor: true,
          role: true,
          isActive: true,
          familyId: true,
        },
      });

      res.json({
        success: true,
        message: "Family member updated successfully",
        data: updatedMember,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyFamily(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user || !req.user.familyId) {
        res.status(404).json({
          success: false,
          message: "User is not associated with a family",
        });
        return;
      }

      const family = await prisma.family.findUnique({
        where: { id: req.user.familyId },
        include: {
          insuranceCompany: true,
          users: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              genderBirth: true,
              genderActual: true,
              profilePictureUrl: true,
              profileLink: true,
              profileColor: true,
              role: true,
              userType: true,
              isActive: true,
              dateOfBirth: true,
              healthProfile: {
                select: {
                  id: true,
                  bloodType: true,
                  height: true,
                  weight: true,
                  allergies: true,
                  chronicConditions: true,
                  medications: true,
                },
              },
            },
          },
        },
      });

      if (!family) {
        res.status(404).json({
          success: false,
          message: "Family not found",
        });
        return;
      }

      res.json({
        success: true,
        data: family,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(
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

      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;

      if (req.user.familyId !== idStr) {
        res.status(403).json({
          success: false,
          message: "Access denied: you can only view your own family",
        });
        return;
      }

      const family = await prisma.family.findUnique({
        where: { id: idStr },
        include: {
          insuranceCompany: true,
          users: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              genderBirth: true,
              genderActual: true,
              profilePictureUrl: true,
              profileLink: true,
              profileColor: true,
              role: true,
              userType: true,
              isActive: true,
            },
          },
        },
      });

      if (!family) {
        res.status(404).json({
          success: false,
          message: "Family not found",
        });
        return;
      }

      res.json({
        success: true,
        data: family,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(
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

      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;

      if (req.user.familyId !== idStr) {
        res.status(403).json({
          success: false,
          message: "Access denied: you can only update your own family",
        });
        return;
      }

      const { familyName, primaryContactEmail, subscriptionStatus } = req.body;

      const updateData: Prisma.FamilyUpdateInput = {};
      if (familyName !== undefined) updateData.familyName = familyName;
      if (primaryContactEmail !== undefined)
        updateData.primaryContactEmail = primaryContactEmail;
      if (subscriptionStatus !== undefined)
        updateData.subscriptionStatus = subscriptionStatus;

      const family = await prisma.family.update({
        where: { id: idStr },
        data: updateData,
        include: {
          insuranceCompany: true,
        },
      });

      res.json({
        success: true,
        message: "Family updated successfully",
        data: family,
      });
    } catch (error) {
      next(error);
    }
  }
}
