import Queue from 'bull';
import { logger } from '../config/logger';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: process.env.NODE_ENV === 'development' ? 1 : 3,
  retryStrategy: (times: number) => {
    if (process.env.NODE_ENV === 'development' && times > 3) {
      return null;
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  connectTimeout: 5000,
  enableReadyCheck: false,
};

let notificationQueue: Queue.Queue;
let reminderQueue: Queue.Queue;

try {
  notificationQueue = new Queue('notifications', {
    redis: redisConfig,
    settings: {
      maxStalledCount: 0,
    },
  });

  reminderQueue = new Queue('reminders', {
    redis: redisConfig,
    settings: {
      maxStalledCount: 0,
    },
  });

  let errorLogged = false;

  notificationQueue.on('error', (error: Error & { code?: string }) => {
    if (process.env.NODE_ENV === 'development') {
      if (error.message && (error.message.includes('ECONNREFUSED') || error.code === 'ECONNREFUSED')) {
        if (!errorLogged) {
          logger.warn('Redis not available - queues will not work. Start Redis with: npm run redis:start');
          errorLogged = true;
        }
        return;
      }
      if (!errorLogged) {
        logger.warn({ error }, 'Notification queue error');
        errorLogged = true;
      }
    } else {
      logger.error({ error }, 'Notification queue error');
    }
  });

  reminderQueue.on('error', (error: Error & { code?: string }) => {
    if (process.env.NODE_ENV === 'development') {
      if (error.message && (error.message.includes('ECONNREFUSED') || error.code === 'ECONNREFUSED')) {
        return;
      }
      if (!errorLogged) {
        logger.warn({ error }, 'Reminder queue error');
      }
    } else {
      logger.error({ error }, 'Reminder queue error');
    }
  });

} catch (error) {
  logger.warn({ error }, 'Failed to initialize queues - Redis may not be available');
  notificationQueue = null as any;
  reminderQueue = null as any;
}


export { notificationQueue, reminderQueue };

