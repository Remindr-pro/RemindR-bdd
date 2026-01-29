import { Request, Response, NextFunction } from 'express';
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

  async getByUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const userIdStr = Array.isArray(userId) ? userId[0] : userId;

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

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, bloodType, height, weight, allergies, chronicConditions, medications, preferences } = req.body;

      const profile = await prisma.healthProfile.create({
        data: {
          userId,
          bloodType,
          height: height ? parseFloat(height) : null,
          weight: weight ? parseFloat(weight) : null,
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

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;
      const { bloodType, height, weight, allergies, chronicConditions, medications, preferences } = req.body;

      const updateData: Prisma.HealthProfileUpdateInput = {};
      if (bloodType !== undefined) updateData.bloodType = bloodType;
      if (height !== undefined) updateData.height = parseFloat(height);
      if (weight !== undefined) updateData.weight = parseFloat(weight);
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

