import { Server } from 'http';
import prisma from '../config/database';
import redis from '../config/redis';
import { notificationQueue, reminderQueue } from '../services/queue.service';
import { stopReminderScheduler } from '../jobs/reminderScheduler';
import { logger } from '../config/logger';

let server: Server | null = null;
let isShuttingDown = false;

export const setServer = (s: Server): void => {
  server = s;
};

const shutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  logger.info({ signal }, 'Starting graceful shutdown');

  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }

  const shutdownPromises: Promise<unknown>[] = [];

  shutdownPromises.push(stopReminderScheduler());

  if (notificationQueue) {
    shutdownPromises.push(
      notificationQueue.close().catch((err: Error) => {
        console.error('Error closing notification queue:', err);
      })
    );
  }

  if (reminderQueue) {
    shutdownPromises.push(
      reminderQueue.close().catch((err: Error) => {
        console.error('Error closing reminder queue:', err);
      })
    );
  }

  shutdownPromises.push(
    redis.quit().catch((err: Error) => {
      console.error('Error closing Redis connection:', err);
      return redis.disconnect().catch(() => {});
    })
  );

  shutdownPromises.push(
    prisma.$disconnect().catch((err: Error) => {
      console.error('Error closing database connection:', err);
    })
  );

  try {
    await Promise.allSettled(shutdownPromises);
    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

export const setupGracefulShutdown = (): void => {
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (error: Error) => {
    logger.fatal({ error }, 'Uncaught Exception');
    shutdown('uncaughtException').catch(() => {
      process.exit(1);
    });
  });
};

