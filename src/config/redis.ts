import Redis from 'ioredis';
import { logger } from './logger';

// Support both REDIS_URL (connection string) and individual REDIS_HOST/PORT/PASSWORD
let redis: Redis;

if (process.env.REDIS_URL) {
  // Use connection string if provided (Upstash format: redis://default:TOKEN@HOST:PORT)
  const redisUrl = process.env.REDIS_URL;
  const maskedUrl = redisUrl.replace(/:([^:@]+)@/, ':****@'); // Mask password
  
  if (process.env.NODE_ENV === 'production') {
    logger.info({ redisUrl: maskedUrl }, 'Redis configuration: Using REDIS_URL connection string');
  }
  
  redis = new Redis(redisUrl, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 20000,
    enableReadyCheck: true,
    keepAlive: 30000,
    retryStrategy: (times: number) => {
      if (times > 10) {
        return null;
      }
      return Math.min(times * 100, 3000);
    },
  });
} else {
  // Use individual configuration
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = parseInt(process.env.REDIS_PORT || '6379');
  const redisPassword = process.env.REDIS_PASSWORD || undefined;

  // Check if Redis host is Upstash (requires TLS)
  const isUpstash = redisHost.includes('upstash.io') || redisHost.includes('upstash.com');

  // Log Redis config for debugging (without password)
  if (process.env.NODE_ENV === 'production') {
    logger.info({
      redisHost,
      redisPort,
      hasPassword: !!redisPassword,
      isUpstash,
      tlsEnabled: isUpstash && redisPort === 6380,
    }, 'Redis configuration: Using individual REDIS_HOST/PORT/PASSWORD');
  }

  const redisConfig: any = {
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy: (times: number) => {
      if (times > 10) {
        return null; // Stop retrying after 10 attempts
      }
      const delay = Math.min(times * 100, 3000);
      return delay;
    },
    maxRetriesPerRequest: 1, // Reduce retries to avoid timeout errors
    connectTimeout: 20000, // Increased timeout for external services
    enableReadyCheck: true,
    keepAlive: 30000,
    family: 4, // Force IPv4
  };

  // Add TLS for Upstash - port 6380 requires TLS, 6379 might not
  if (isUpstash && redisPort === 6380) {
    redisConfig.tls = {
      rejectUnauthorized: false, // Upstash uses self-signed certificates
    };
  } else if (isUpstash && redisPort === 6379) {
    // Port 6379 on Upstash might not need TLS, but try with TLS if connection fails
    logger.warn('Upstash detected but port is 6379 - trying without TLS first');
  }

  redis = process.env.NODE_ENV === 'test'
    ? (new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        lazyConnect: true,
        enableOfflineQueue: false,
      }) as Redis)
    : new Redis(redisConfig);
}

if (process.env.NODE_ENV !== 'test') {
  let redisErrorLogged = false;

  redis.on('connect', () => {
    logger.info('Redis connected');
    redisErrorLogged = false;
  });

  redis.on('error', (err: Error & { code?: string }) => {
    if (process.env.NODE_ENV === 'development') {
      if (!redisErrorLogged && (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED'))) {
        logger.warn('Redis not available - queues will not work. Start Redis with: npm run redis:start');
        redisErrorLogged = true;
      }
    } else {
      // En production, on log seulement une fois pour éviter le spam
      if (!redisErrorLogged && (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED'))) {
        logger.warn('Redis not available - queues and cache will not work. Configure REDIS_HOST and REDIS_PORT in environment variables.');
        redisErrorLogged = true;
      } else if (!redisErrorLogged) {
        logger.error({ err }, 'Redis connection error');
        redisErrorLogged = true;
      }
    }
  });

  redis.on('ready', () => {
    logger.debug('Redis ready');
  });
}

export default redis;

