import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export class RecommendationController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const recommendations = await prisma.recommendation.findMany({
        where: {
          userId: req.user.id,
          isDismissed: false,
        },
        include: {
          partner: true,
          article: {
            include: {
              category: true,
            },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
      });

      res.json({
        success: true,
        data: recommendations,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const recommendation = await prisma.recommendation.findUnique({
        where: { id },
        include: {
          partner: true,
          article: {
            include: {
              category: true,
            },
          },
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

      if (!recommendation) {
        return res.status(404).json({
          success: false,
          message: 'Recommendation not found',
        });
      }

      res.json({
        success: true,
        data: recommendation,
      });
    } catch (error) {
      next(error);
    }
  }

  async dismiss(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const recommendation = await prisma.recommendation.update({
        where: { id },
        data: {
          isDismissed: true,
          dismissedAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: 'Recommendation dismissed',
        data: recommendation,
      });
    } catch (error) {
      next(error);
    }
  }

  async recordClick(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const recommendation = await prisma.recommendation.update({
        where: { id },
        data: {
          clickedAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: 'Click recorded',
        data: recommendation,
      });
    } catch (error) {
      next(error);
    }
  }
}

