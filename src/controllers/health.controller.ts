import { Request, Response } from 'express';
import prisma from '../config/database';
import redis from '../config/redis';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
    };
    redis: {
      status: 'up' | 'down';
      responseTime?: number;
    };
  };
}

export const healthCheck = async (_req: Request, res: Response): Promise<void> => {
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: { status: 'down' },
      redis: { status: 'down' },
    },
  };

  const checks: Promise<void>[] = [];

  checks.push(
    (async () => {
      try {
        const dbStart = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        healthStatus.services.database = {
          status: 'up',
          responseTime: Date.now() - dbStart,
        };
      } catch {
        healthStatus.services.database = { status: 'down' };
        healthStatus.status = 'unhealthy';
      }
    })()
  );

  checks.push(
    (async () => {
      try {
        const redisStart = Date.now();
        await redis.ping();
        healthStatus.services.redis = {
          status: 'up',
          responseTime: Date.now() - redisStart,
        };
      } catch {
        healthStatus.services.redis = { status: 'down' };
        if (healthStatus.status === 'healthy') {
          healthStatus.status = 'degraded';
        }
      }
    })()
  );

  await Promise.allSettled(checks);

  const statusCode = healthStatus.status === 'healthy' ? 200 : healthStatus.status === 'degraded' ? 200 : 503;
  res.status(statusCode).json(healthStatus);
};
