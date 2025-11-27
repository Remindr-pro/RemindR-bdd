import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export class QuestionnaryController {
  async getMyQuestionnary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const questionnary = await prisma.questionnary.findUnique({
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

      if (!questionnary) {
        res.status(404).json({
          success: false,
          message: 'Questionnary not found',
        });
        return;
      }

      res.json({
        success: true,
        data: questionnary,
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
        step,
        nbPersonsFollowed,
        hasGeneralPractitioner,
        generalPractitionerName,
        physicalActivityFrequency,
        dietType,
        usesAlternativeMedicine,
        alternativeMedicineTypes,
        lastHealthCheck,
        enabledReminderTypes,
        reminderFrequency,
        enabledNotificationChannels,
      } = req.body;

      const questionnary = await prisma.questionnary.create({
        data: {
          userId: req.user.id,
          step: step || 1,
          nbPersonsFollowed: nbPersonsFollowed || 1,
          hasGeneralPractitioner,
          generalPractitionerName,
          physicalActivityFrequency,
          dietType,
          usesAlternativeMedicine: usesAlternativeMedicine || false,
          alternativeMedicineTypes: alternativeMedicineTypes || [],
          lastHealthCheck,
          enabledReminderTypes: enabledReminderTypes || [],
          reminderFrequency,
          enabledNotificationChannels: enabledNotificationChannels || [],
        },
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

      res.status(201).json({
        success: true,
        message: 'Questionnary created successfully',
        data: questionnary,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const {
        step,
        nbPersonsFollowed,
        hasGeneralPractitioner,
        generalPractitionerName,
        physicalActivityFrequency,
        dietType,
        usesAlternativeMedicine,
        alternativeMedicineTypes,
        lastHealthCheck,
        enabledReminderTypes,
        reminderFrequency,
        enabledNotificationChannels,
      } = req.body;

      const updateData: any = {};
      if (step !== undefined) updateData.step = step;
      if (nbPersonsFollowed !== undefined) updateData.nbPersonsFollowed = nbPersonsFollowed;
      if (hasGeneralPractitioner !== undefined) updateData.hasGeneralPractitioner = hasGeneralPractitioner;
      if (generalPractitionerName !== undefined) updateData.generalPractitionerName = generalPractitionerName;
      if (physicalActivityFrequency !== undefined) updateData.physicalActivityFrequency = physicalActivityFrequency;
      if (dietType !== undefined) updateData.dietType = dietType;
      if (usesAlternativeMedicine !== undefined) updateData.usesAlternativeMedicine = usesAlternativeMedicine;
      if (alternativeMedicineTypes !== undefined) updateData.alternativeMedicineTypes = alternativeMedicineTypes;
      if (lastHealthCheck !== undefined) updateData.lastHealthCheck = lastHealthCheck;
      if (enabledReminderTypes !== undefined) updateData.enabledReminderTypes = enabledReminderTypes;
      if (reminderFrequency !== undefined) updateData.reminderFrequency = reminderFrequency;
      if (enabledNotificationChannels !== undefined) updateData.enabledNotificationChannels = enabledNotificationChannels;

      const questionnary = await prisma.questionnary.update({
        where: { id },
        data: updateData,
      });

      res.json({
        success: true,
        message: 'Questionnary updated successfully',
        data: questionnary,
      });
    } catch (error) {
      next(error);
    }
  }
}

