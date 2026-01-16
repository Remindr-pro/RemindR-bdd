import { Request, Response, NextFunction } from 'express';
import redis from '../config/redis';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyGenerator?: (req: Request) => string;
}

const defaultTTL = 300; // 5 minutes

export const cache = (options: CacheOptions = {}) => {
  const ttl = options.ttl || defaultTTL;
  const keyGenerator = options.keyGenerator || ((req: Request) => {
    return `cache:${req.method}:${req.originalUrl}`;
  });

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.method !== 'GET') {
      next();
      return;
    }

    try {
      const cacheKey = keyGenerator(req);
      const cached = await redis.get(cacheKey);

      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        res.json(JSON.parse(cached));
        return;
      }

      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        redis.setex(cacheKey, ttl, JSON.stringify(body)).catch(() => {
          // Ignore cache errors
        });
        res.setHeader('X-Cache', 'MISS');
        return originalJson(body);
      };

      next();
    } catch (error) {
      next();
    }
  };
};

export const invalidateCache = async (pattern: string): Promise<void> => {
  try {
    // Use SCAN instead of KEYS for better performance in production
    const stream = redis.scanStream({
      match: `cache:*${pattern}*`,
      count: 100,
    });

    const keys: string[] = [];
    stream.on('data', (resultKeys: string[]) => {
      keys.push(...resultKeys);
    });

    await new Promise<void>((resolve, reject) => {
      stream.on('end', () => {
        if (keys.length > 0) {
          // Delete in batches to avoid blocking
          const batchSize = 100;
          const batches: string[][] = [];
          for (let i = 0; i < keys.length; i += batchSize) {
            batches.push(keys.slice(i, i + batchSize));
          }
          Promise.all(batches.map(batch => redis.del(...batch)))
            .then(() => resolve())
            .catch(reject);
        } else {
          resolve();
        }
      });
      stream.on('error', reject);
    });
  } catch (error) {
    // Ignore cache invalidation errors
  }
};

