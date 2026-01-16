import request from 'supertest';
import app from '../../server';
import redis from '../../config/redis';
import prisma from '../../config/database';

jest.mock('../../config/redis', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    setex: jest.fn(),
    keys: jest.fn(),
    del: jest.fn(),
  },
}));

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    article: {
      findMany: jest.fn(),
    },
    tokenBlacklist: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
  },
}));

jest.setTimeout(10000);

describe('Cache Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should cache GET requests to articles endpoint', async () => {
    (redis.get as jest.Mock).mockResolvedValue(null);
    (redis.setex as jest.Mock).mockResolvedValue('OK');
    (prisma.article.findMany as jest.Mock).mockResolvedValue([]);

    const response1 = await request(app).get('/api/v1/articles');

    expect(response1.status).toBe(200);
    expect(response1.headers['x-cache']).toBe('MISS');
    expect(redis.get).toHaveBeenCalled();
    expect(redis.setex).toHaveBeenCalled();

    // Reset mocks for second request
    jest.clearAllMocks();
    (redis.get as jest.Mock).mockResolvedValue(JSON.stringify({ success: true, data: [] }));
    (prisma.tokenBlacklist.findUnique as jest.Mock).mockResolvedValue(null);

    const response2 = await request(app).get('/api/v1/articles');

    expect(response2.status).toBe(200);
    expect(response2.headers['x-cache']).toBe('HIT');
    expect(redis.get).toHaveBeenCalled();
  });

  it('should not cache POST requests', async () => {
    await request(app)
      .post('/api/v1/articles')
      .set('Authorization', 'Bearer test-token')
      .send({ title: 'Test Article' });

    expect(redis.get).not.toHaveBeenCalled();
    expect(redis.setex).not.toHaveBeenCalled();
  });
});

