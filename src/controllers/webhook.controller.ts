import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { Prisma } from '@prisma/client';

export class WebhookController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const webhooks = await prisma.webhook.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { webhookLogs: true },
          },
        },
      });

      res.json({
        success: true,
        data: webhooks,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;

      const webhook = await prisma.webhook.findUnique({
        where: { id: idStr },
        include: {
          webhookLogs: {
            take: 50,
            orderBy: { triggeredAt: 'desc' },
          },
        },
      });

      if (!webhook) {
        res.status(404).json({
          success: false,
          message: 'Webhook not found',
        });
        return;
      }

      res.json({
        success: true,
        data: webhook,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url, events, secret, isActive } = req.body;

      if (!url || !events || !Array.isArray(events) || events.length === 0) {
        res.status(400).json({
          success: false,
          message: 'URL and events are required',
        });
        return;
      }

      const webhook = await prisma.webhook.create({
        data: {
          url,
          events,
          secret: secret || null,
          isActive: isActive !== undefined ? isActive : true,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Webhook created successfully',
        data: webhook,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;
      const { url, events, secret, isActive } = req.body;

      const updateData: Prisma.WebhookUpdateInput = {};
      if (url) updateData.url = url;
      if (events) updateData.events = events;
      if (secret !== undefined) updateData.secret = secret || null;
      if (isActive !== undefined) updateData.isActive = isActive;

      const webhook = await prisma.webhook.update({
        where: { id: idStr },
        data: updateData,
      });

      res.json({
        success: true,
        message: 'Webhook updated successfully',
        data: webhook,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;

      await prisma.webhook.delete({
        where: { id: idStr },
      });

      res.json({
        success: true,
        message: 'Webhook deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;
      const limit = parseInt(req.query.limit as string) || 50;

      const logs = await prisma.webhookLog.findMany({
        where: { webhookId: idStr },
        orderBy: { triggeredAt: 'desc' },
        take: limit,
      });

      res.json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }
}

