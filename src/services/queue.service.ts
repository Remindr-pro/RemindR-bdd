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
    enableOfflineQueue: true, // Allow commands when not connected (Bull needs this)
    lazyConnect: true, // Don't connect immediately
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

let notificationQueue: Queue.Queue | null = null;
let reminderQueue: Queue.Queue | null = null;
let queueErrorLogged = false;

// Initialize queues with error handling
const initializeQueues = () => {
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

    // Error handlers - log only once to avoid spam
    notificationQueue.on('error', (error: Error & { code?: string }) => {
      const isConnectionError = error.code === 'ECONNREFUSED' || 
                                error.code === 'ETIMEDOUT' ||
                                error.message?.includes('ECONNREFUSED') ||
                                error.message?.includes('ETIMEDOUT') ||
                                error.message?.includes('Stream isn\'t writeable');
      
      if (isConnectionError && !queueErrorLogged) {
        logger.warn({ 
          code: error.code,
          message: error.message 
        }, 'Redis connection failed - queues disabled. Application will run in degraded mode.');
        queueErrorLogged = true;
      } else if (!isConnectionError && !queueErrorLogged) {
        logger.error({ error }, 'Notification queue error');
        queueErrorLogged = true;
      }
    });

    reminderQueue.on('error', (error: Error & { code?: string }) => {
      const isConnectionError = error.code === 'ECONNREFUSED' || 
                                error.code === 'ETIMEDOUT' ||
                                error.message?.includes('ECONNREFUSED') ||
                                error.message?.includes('ETIMEDOUT') ||
                                error.message?.includes('Stream isn\'t writeable');
      
      if (isConnectionError && !queueErrorLogged) {
        // Already logged by notificationQueue
        return;
      } else if (!isConnectionError && !queueErrorLogged) {
        logger.error({ error }, 'Reminder queue error');
        queueErrorLogged = true;
      }
    });

    // Log successful connection
    notificationQueue.on('ready', () => {
      if (!queueErrorLogged) {
        logger.info('Redis queues initialized successfully');
      }
    });

  } catch (error) {
    logger.warn({ error }, 'Failed to initialize queues - Redis may not be available. Application will run in degraded mode.');
    notificationQueue = null;
    reminderQueue = null;
  }
};

// Initialize queues
initializeQueues();


export { notificationQueue, reminderQueue };

