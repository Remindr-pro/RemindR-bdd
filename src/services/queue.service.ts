import Queue from 'bull';
import { logger } from '../config/logger';

// Support both REDIS_URL (connection string) and individual REDIS_HOST/PORT/PASSWORD
let redisConfig: any;

if (process.env.REDIS_URL) {
  // Use connection string if provided (Upstash format: redis://default:TOKEN@HOST:PORT)
  redisConfig = process.env.REDIS_URL;
} else {
  // Use individual configuration
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = parseInt(process.env.REDIS_PORT || '6379');
  const redisPassword = process.env.REDIS_PASSWORD || undefined;

  // Check if Redis host is Upstash (requires TLS)
  const isUpstash = redisHost.includes('upstash.io') || redisHost.includes('upstash.com');

  redisConfig = {
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    // Bull.js doesn't allow enableReadyCheck or maxRetriesPerRequest in config
    // These options are handled by Bull internally
    retryStrategy: (times: number) => {
      if (times > 10) {
        return null; // Stop retrying after 10 attempts
      }
      const delay = Math.min(times * 100, 3000);
      return delay;
    },
    connectTimeout: 20000, // Increased timeout for external services
    keepAlive: 30000,
    family: 4, // Force IPv4
    enableOfflineQueue: false,
  };

  // Add TLS for Upstash - port 6380 requires TLS, 6379 might not
  if (isUpstash && redisPort === 6380) {
    redisConfig.tls = {
      rejectUnauthorized: false, // Upstash uses self-signed certificates
    };
  } else if (isUpstash && redisPort === 6379) {
    // Port 6379 on Upstash might not need TLS
    logger.warn('Upstash detected but port is 6379 - trying without TLS');
  }

  // Log Redis config for debugging (without password)
  if (process.env.NODE_ENV === 'production') {
    logger.info({
      redisHost: redisConfig.host,
      redisPort: redisConfig.port,
      hasPassword: !!redisConfig.password,
    }, 'Queue Redis configuration loaded');
  }
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

