import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { Prisma } from '@prisma/client';

export class FamilyController {
  async getMyFamily(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.familyId) {
        res.status(404).json({
          success: false,
          message: 'User is not associated with a family',
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
          message: 'Family not found',
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

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

      if (req.user.familyId !== idStr) {
        res.status(403).json({
          success: false,
          message: 'Access denied: you can only view your own family',
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
          message: 'Family not found',
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

      if (req.user.familyId !== idStr) {
        res.status(403).json({
          success: false,
          message: 'Access denied: you can only update your own family',
        });
        return;
      }

      const { familyName, primaryContactEmail, subscriptionStatus } = req.body;

      const updateData: Prisma.FamilyUpdateInput = {};
      if (familyName !== undefined) updateData.familyName = familyName;
      if (primaryContactEmail !== undefined) updateData.primaryContactEmail = primaryContactEmail;
      if (subscriptionStatus !== undefined) updateData.subscriptionStatus = subscriptionStatus;

      const family = await prisma.family.update({
        where: { id: idStr },
        data: updateData,
        include: {
          insuranceCompany: true,
        },
      });

      res.json({
        success: true,
        message: 'Family updated successfully',
        data: family,
      });
    } catch (error) {
      next(error);
    }
  }
}

