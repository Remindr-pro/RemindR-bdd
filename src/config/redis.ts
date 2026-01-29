import Redis from 'ioredis';
import { logger } from './logger';

const redis = process.env.NODE_ENV === 'test'
  ? (new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
      enableOfflineQueue: false,
    }) as Redis)
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
      enableOfflineQueue: false,
      retryStrategy: (times) => {
        if (process.env.NODE_ENV === 'development' && times > 3) {
          return null;
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: process.env.NODE_ENV === 'development' ? 1 : 3,
      connectTimeout: 5000,
      enableReadyCheck: false,
    });

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

