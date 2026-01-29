import Queue from 'bull';
import { logger } from '../config/logger';

// Check if Redis host is Upstash (requires TLS)
const isUpstash = process.env.REDIS_HOST?.includes('upstash.io') || process.env.REDIS_HOST?.includes('upstash.com');

const redisConfig: any = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Disable max retries for external services
  retryStrategy: (times: number) => {
    if (times > 10) {
      return null; // Stop retrying after 10 attempts
    }
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  connectTimeout: 20000, // Increased timeout for external services
  enableReadyCheck: true,
  keepAlive: 30000,
  family: 4, // Force IPv4
  enableOfflineQueue: false,
};

// Add TLS for Upstash - but check if port indicates TLS
// Upstash uses port 6380 for TLS, 6379 for non-TLS
if (isUpstash && redisConfig.port === 6380) {
  redisConfig.tls = {
    rejectUnauthorized: false, // Upstash uses self-signed certificates
  };
} else if (isUpstash && redisConfig.port === 6379) {
  // Port 6379 on Upstash might not need TLS
  // Try without TLS first
  logger.warn('Upstash detected but port is 6379 - trying without TLS');
}

// Log Redis config for debugging (without password)
if (process.env.NODE_ENV === 'production') {
  logger.info({
    redisHost: redisConfig.host,
    redisPort: redisConfig.port,
    hasPassword: !!redisConfig.password,
  }, 'Redis configuration loaded');
}

let notificationQueue: Queue.Queue | null;
let reminderQueue: Queue.Queue | null;

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
  notificationQueue = null;
  reminderQueue = null;
}


export { notificationQueue, reminderQueue };

