import Queue from 'bull';
import redis from '../config/redis';

// Notification queue
export const notificationQueue = new Queue('notifications', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
});

// Reminder queue for scheduled reminders
export const reminderQueue = new Queue('reminders', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
});

// Cleanup on shutdown
process.on('SIGTERM', async () => {
  await notificationQueue.close();
  await reminderQueue.close();
  redis.disconnect();
});

