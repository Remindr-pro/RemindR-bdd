import Queue from 'bull';
import redis from '../config/redis';

export const notificationQueue = new Queue('notifications', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
});

export const reminderQueue = new Queue('reminders', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
});

process.on('SIGTERM', async () => {
  await notificationQueue.close();
  await reminderQueue.close();
  redis.disconnect();
});

