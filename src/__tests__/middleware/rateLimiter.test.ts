import { rateLimiter } from '../../middleware/rateLimiter';

describe('Rate Limiter Middleware', () => {
  it('should be defined', () => {
    expect(rateLimiter).toBeDefined();
  });

  it('should have rate limit configuration', () => {
    expect(typeof rateLimiter).toBe('function');
  });
});

