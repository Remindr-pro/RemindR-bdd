import { Request, Response, NextFunction } from 'express';
import { cache } from '../../middleware/cache';
import redis from '../../config/redis';

jest.mock('../../config/redis', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    setex: jest.fn(),
    keys: jest.fn(),
    del: jest.fn(),
  },
}));

describe('Cache Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      method: 'GET',
      originalUrl: '/api/v1/articles',
      headers: {},
    };

    mockRes = {
      json: jest.fn(),
      setHeader: jest.fn(),
    };

    mockNext = jest.fn();
  });

  it('should skip caching for non-GET requests', async () => {
    mockReq.method = 'POST';
    const middleware = cache();

    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(redis.get).not.toHaveBeenCalled();
    expect(redis.setex).not.toHaveBeenCalled();
  });

  it('should return cached response if available', async () => {
    const cachedData = { success: true, data: [] };
    const cacheKey = `cache:GET:${mockReq.originalUrl}`;
    (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(cachedData));

    const middleware = cache();
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(redis.get).toHaveBeenCalledWith(cacheKey);
    expect(mockRes.json).toHaveBeenCalledWith(cachedData);
    expect(mockRes.setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should cache response if not in cache', async () => {
    (redis.get as jest.Mock).mockResolvedValue(null);
    (redis.setex as jest.Mock).mockResolvedValue('OK');

    const middleware = cache();
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    const cacheKey = `cache:GET:${mockReq.originalUrl}`;
    expect(redis.get).toHaveBeenCalledWith(cacheKey);
    expect(mockNext).toHaveBeenCalled();

    // Simulate the response being sent (which triggers the cache)
    // The middleware modifies res.json, so we need to call the modified version
    const responseData = { success: true, data: [] };
    if (mockRes.json) {
      mockRes.json(responseData);
    }

    // setHeader is called in the modified json function, not in the middleware
    expect(mockRes.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
    expect(redis.setex).toHaveBeenCalledWith(
      cacheKey,
      300, // default TTL
      JSON.stringify(responseData)
    );
  });

  it('should handle cache errors gracefully', async () => {
    (redis.get as jest.Mock).mockRejectedValue(new Error('Redis error'));

    const middleware = cache();
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});

