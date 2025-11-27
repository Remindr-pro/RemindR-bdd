import prisma from '../../config/database';

describe('Database Configuration', () => {
  it('should export Prisma client', () => {
    expect(prisma).toBeDefined();
    expect(prisma).toHaveProperty('user');
    expect(prisma).toHaveProperty('reminder');
    expect(prisma).toHaveProperty('healthProfile');
  });

  it('should have all model methods', () => {
    expect(typeof prisma.user.findMany).toBe('function');
    expect(typeof prisma.reminder.findMany).toBe('function');
    expect(typeof prisma.healthProfile.findMany).toBe('function');
  });
});

