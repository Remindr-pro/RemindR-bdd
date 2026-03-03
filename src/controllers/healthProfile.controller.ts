import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { Prisma } from '@prisma/client';

export class HealthProfileController {
  async getMyProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const profile = await prisma.healthProfile.findUnique({
        where: { userId: req.user.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!profile) {
        res.status(404).json({
          success: false,
          message: 'Health profile not found',
        });
        return;
      }

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByUserId(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { userId } = req.params;
      const userIdStr = Array.isArray(userId) ? userId[0] : userId;

      // Vérifier que l'utilisateur cible appartient à la même famille
      const targetUser = await prisma.user.findUnique({
        where: { id: userIdStr },
        select: { familyId: true },
      });

      if (!targetUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      if (targetUser.familyId !== req.user.familyId || !req.user.familyId) {
        res.status(403).json({
          success: false,
          message: 'Access denied: you can only view health profiles of family members',
        });
        return;
      }

      const profile = await prisma.healthProfile.findUnique({
        where: { userId: userIdStr },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!profile) {
        res.status(404).json({
          success: false,
          message: 'Health profile not found',
        });
        return;
      }

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const {
        userId,
        bloodType,
        height,
        heightMeasuredAt,
        weight,
        weightMeasuredAt,
        allergies,
        chronicConditions,
        medications,
        preferences,
      } = req.body;

      // L'utilisateur ne peut créer un profil que pour lui-même ou un membre de sa famille
      if (userId !== req.user.id) {
        const targetUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { familyId: true },
        });
        if (!targetUser || targetUser.familyId !== req.user.familyId || !req.user.familyId) {
          res.status(403).json({
            success: false,
            message: 'Access denied: you can only create health profiles for yourself or family members',
          });
          return;
        }
      }

      const profile = await prisma.healthProfile.create({
        data: {
          userId,
          bloodType,
          height: height ? parseFloat(height) : null,
          heightMeasuredAt: heightMeasuredAt ? new Date(heightMeasuredAt) : null,
          weight: weight ? parseFloat(weight) : null,
          weightMeasuredAt: weightMeasuredAt ? new Date(weightMeasuredAt) : null,
          allergies: allergies || [],
          chronicConditions: chronicConditions || [],
          medications: medications || [],
          preferences: preferences || {},
        },
      });

      res.status(201).json({
        success: true,
        message: 'Health profile created successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;
      const {
        bloodType,
        height,
        heightMeasuredAt,
        weight,
        weightMeasuredAt,
        allergies,
        chronicConditions,
        medications,
        preferences,
      } = req.body;

      const existingProfile = await prisma.healthProfile.findUnique({
        where: { id: idStr },
        include: { user: { select: { familyId: true } } },
      });

      if (!existingProfile) {
        res.status(404).json({
          success: false,
          message: 'Health profile not found',
        });
        return;
      }

      // L'utilisateur ne peut modifier que son propre profil ou celui d'un membre de sa famille
      const isOwnProfile = existingProfile.userId === req.user.id;
      const isFamilyMember = req.user.familyId && existingProfile.user.familyId === req.user.familyId;
      if (!isOwnProfile && !isFamilyMember) {
        res.status(403).json({
          success: false,
          message: 'Access denied: you can only update your own health profile or family members',
        });
        return;
      }

      const updateData: Prisma.HealthProfileUpdateInput = {};
      if (bloodType !== undefined) updateData.bloodType = bloodType;
      if (height !== undefined) updateData.height = parseFloat(height);
      if (heightMeasuredAt !== undefined) {
        updateData.heightMeasuredAt = heightMeasuredAt
          ? new Date(heightMeasuredAt)
          : null;
      }
      if (weight !== undefined) updateData.weight = parseFloat(weight);
      if (weightMeasuredAt !== undefined) {
        updateData.weightMeasuredAt = weightMeasuredAt
          ? new Date(weightMeasuredAt)
          : null;
      }
      if (allergies !== undefined) updateData.allergies = allergies;
      if (chronicConditions !== undefined) updateData.chronicConditions = chronicConditions;
      if (medications !== undefined) updateData.medications = medications;
      if (preferences !== undefined) updateData.preferences = preferences;

      const profile = await prisma.healthProfile.update({
        where: { id: idStr },
        data: updateData,
      });

      res.json({
        success: true,
        message: 'Health profile updated successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
}

