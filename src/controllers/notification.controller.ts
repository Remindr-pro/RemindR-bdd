import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export class NotificationController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { limit = 50, offset = 0, userId } = req.query;
      let targetUserId = req.user.id;

      if (typeof userId === 'string' && userId !== req.user.id) {
        if (!req.user.familyId) {
          res.status(403).json({
            success: false,
            message: 'Access denied',
          });
          return;
        }

        const targetUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { familyId: true },
        });

        if (!targetUser || targetUser.familyId !== req.user.familyId) {
          res.status(403).json({
            success: false,
            message: 'Access denied',
          });
          return;
        }

        targetUserId = userId;
      }

      const notifications = await prisma.notificationLog.findMany({
        where: { userId: targetUserId },
        include: {
          reminder: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      });

      res.json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;

      const notification = await prisma.notificationLog.findFirst({
        where: {
          id: idStr,
          userId: req.user.id,
        },
        include: {
          reminder: true,
        },
      });

      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
        return;
      }

      res.json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;

      const existing = await prisma.notificationLog.findFirst({
        where: {
          id: idStr,
          userId: req.user.id,
        },
      });

      if (!existing) {
        res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
        return;
      }

      const notification = await prisma.notificationLog.update({
        where: { id: idStr },
        data: {
          clicked: true,
        },
      });

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }
}

