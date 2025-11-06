import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export class ReminderController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const reminders = await prisma.reminder.findMany({
        where: { userId: req.user.id },
        include: {
          type: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: reminders,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const reminder = await prisma.reminder.findUnique({
        where: { id },
        include: {
          type: true,
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

      if (!reminder) {
        return res.status(404).json({
          success: false,
          message: 'Reminder not found',
        });
      }

      res.json({
        success: true,
        data: reminder,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const { typeId, title, description, scheduledTime, recurrence, startDate, endDate } = req.body;

      const reminder = await prisma.reminder.create({
        data: {
          userId: req.user.id,
          typeId,
          title,
          description,
          scheduledTime: new Date(`1970-01-01T${scheduledTime}`),
          recurrence: recurrence || null,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
        },
        include: {
          type: true,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Reminder created successfully',
        data: reminder,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { typeId, title, description, scheduledTime, recurrence, startDate, endDate, isActive } = req.body;

      const updateData: any = {};
      if (typeId) updateData.typeId = typeId;
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (scheduledTime) updateData.scheduledTime = new Date(`1970-01-01T${scheduledTime}`);
      if (recurrence !== undefined) updateData.recurrence = recurrence;
      if (startDate) updateData.startDate = new Date(startDate);
      if (endDate) updateData.endDate = new Date(endDate);
      if (isActive !== undefined) updateData.isActive = isActive;

      const reminder = await prisma.reminder.update({
        where: { id },
        data: updateData,
        include: {
          type: true,
        },
      });

      res.json({
        success: true,
        message: 'Reminder updated successfully',
        data: reminder,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.reminder.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Reminder deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const reminder = await prisma.reminder.findUnique({
        where: { id },
      });

      if (!reminder) {
        return res.status(404).json({
          success: false,
          message: 'Reminder not found',
        });
      }

      const updated = await prisma.reminder.update({
        where: { id },
        data: { isActive: !reminder.isActive },
      });

      res.json({
        success: true,
        message: `Reminder ${updated.isActive ? 'activated' : 'deactivated'}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

