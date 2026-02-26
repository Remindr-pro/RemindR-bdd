import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export class AnalyticsController {
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const [
        totalUsers,
        totalFamilies,
        totalReminders,
        activeReminders,
        totalRecommendations,
        totalNotifications,
        usersLast30Days,
      ] = await Promise.all([
        prisma.user.count({ where: { userType: 'INDIVIDUAL' } }),
        prisma.family.count(),
        prisma.reminder.count(),
        prisma.reminder.count({ where: { isActive: true } }),
        prisma.recommendation.count(),
        prisma.notificationLog.count(),
        prisma.user.count({
          where: {
            userType: 'INDIVIDUAL',
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          users: {
            total: totalUsers,
            newLast30Days: usersLast30Days,
          },
          families: {
            total: totalFamilies,
          },
          reminders: {
            total: totalReminders,
            active: activeReminders,
          },
          recommendations: {
            total: totalRecommendations,
          },
          notifications: {
            total: totalNotifications,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
