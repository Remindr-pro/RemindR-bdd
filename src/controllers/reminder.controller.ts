import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { Prisma } from '@prisma/client';

export class ReminderController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
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

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;

      const reminder = await prisma.reminder.findUnique({
        where: { id: idStr },
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
        res.status(404).json({
          success: false,
          message: 'Reminder not found',
        });
        return;
      }

      res.json({
        success: true,
        data: reminder,
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

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;
      const { typeId, title, description, scheduledTime, recurrence, startDate, endDate, isActive } = req.body;

      const updateData: Prisma.ReminderUpdateInput = {};
      if (typeId) {
        updateData.type = {
          connect: { id: typeof typeId === 'string' ? typeId : String(typeId) },
        };
      }
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (scheduledTime) updateData.scheduledTime = new Date(`1970-01-01T${scheduledTime}`);
      if (recurrence !== undefined) updateData.recurrence = recurrence;
      if (startDate) updateData.startDate = new Date(startDate);
      if (endDate) updateData.endDate = new Date(endDate);
      if (isActive !== undefined) updateData.isActive = isActive;

      const reminder = await prisma.reminder.update({
        where: { id: idStr },
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

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;

      await prisma.reminder.delete({
        where: { id: idStr },
      });

      res.json({
        success: true,
        message: 'Reminder deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;

      const reminder = await prisma.reminder.findUnique({
        where: { id: idStr },
      });

      if (!reminder) {
        res.status(404).json({
          success: false,
          message: 'Reminder not found',
        });
        return;
      }

      const updated = await prisma.reminder.update({
        where: { id: idStr },
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

