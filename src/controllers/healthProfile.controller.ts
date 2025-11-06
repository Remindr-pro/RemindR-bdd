import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export class HealthProfileController {
  async getMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
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
        return res.status(404).json({
          success: false,
          message: 'Health profile not found',
        });
      }

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const profile = await prisma.healthProfile.findUnique({
        where: { userId },
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
        return res.status(404).json({
          success: false,
          message: 'Health profile not found',
        });
      }

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
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

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { bloodType, height, weight, allergies, chronicConditions, medications, preferences } = req.body;

      const updateData: any = {};
      if (bloodType !== undefined) updateData.bloodType = bloodType;
      if (height !== undefined) updateData.height = parseFloat(height);
      if (weight !== undefined) updateData.weight = parseFloat(weight);
      if (allergies !== undefined) updateData.allergies = allergies;
      if (chronicConditions !== undefined) updateData.chronicConditions = chronicConditions;
      if (medications !== undefined) updateData.medications = medications;
      if (preferences !== undefined) updateData.preferences = preferences;

      const profile = await prisma.healthProfile.update({
        where: { id },
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

