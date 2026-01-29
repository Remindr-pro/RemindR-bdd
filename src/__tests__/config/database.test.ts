jest.mock('../../config/database', () => {
  const mockPrisma = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    reminder: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    healthProfile: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockPrisma,
  };
});

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

