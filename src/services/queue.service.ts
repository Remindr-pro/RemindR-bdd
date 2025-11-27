import Queue from 'bull';
import redis from '../config/redis';

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
          console.warn('⚠️  Redis not available - queues will not work. Start Redis with: npm run redis:start');
          errorLogged = true;
        }
        return;
      }
      if (!errorLogged) {
        console.warn('Notification queue error:', error.message || error);
        errorLogged = true;
      }
    } else {
      console.error('Notification queue error:', error);
    }
  });

  reminderQueue.on('error', (error: Error & { code?: string }) => {
    if (process.env.NODE_ENV === 'development') {
      if (error.message && (error.message.includes('ECONNREFUSED') || error.code === 'ECONNREFUSED')) {
        return;
      }
      if (!errorLogged) {
        console.warn('Reminder queue error:', error.message || error);
      }
    } else {
      console.error('Reminder queue error:', error);
    }
  });

} catch (error) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Failed to initialize queues - Redis may not be available');
  } else {
    console.error('Failed to initialize queues:', error);
  }
  
  notificationQueue = null as any;
  reminderQueue = null as any;
}

process.on('SIGTERM', async () => {
  try {
    if (notificationQueue) await notificationQueue.close().catch(() => {});
    if (reminderQueue) await reminderQueue.close().catch(() => {});
    redis.disconnect().catch(() => {});
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error closing queues:', error);
    }
  }
});

export { notificationQueue, reminderQueue };

