import request from 'supertest';
import app from '../../server';
import prisma from '../../config/database';
import { generateToken } from '../../utils/jwt';
import { UserType } from '@prisma/client';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
    },
    webhook: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    tokenBlacklist: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
  },
}));

describe('Webhooks Integration', () => {
  let adminToken: string;
  let adminUser: any;

  beforeAll(async () => {
    adminUser = {
      id: 'admin-123',
      email: 'admin@test.com',
      passwordHash: 'hashed',
      firstName: 'Admin',
      lastName: 'User',
      dateOfBirth: new Date('1990-01-01'),
      role: 'admin',
      userType: UserType.ADMIN,
      familyId: null,
      isActive: true,
    };

    adminToken = generateToken({
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      userType: adminUser.userType,
      familyId: adminUser.familyId,
    });

    // Mock user lookup for token validation
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(adminUser);
  });

  afterAll(async () => {
    jest.clearAllMocks();
    (prisma.user.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.webhook.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
  });

  describe('POST /api/v1/webhooks', () => {
    it('should create a webhook with valid data', async () => {
      const mockWebhook = {
        id: 'webhook-123',
        url: 'https://example.com/webhook',
        events: ['user.created', 'user.updated'],
        secret: 'test-secret',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (prisma.webhook.create as jest.Mock).mockResolvedValue(mockWebhook);

      const response = await request(app)
        .post('/api/v1/webhooks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          url: 'https://example.com/webhook',
          events: ['user.created', 'user.updated'],
          secret: 'test-secret',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.url).toBe('https://example.com/webhook');
      expect(response.body.data.events).toContain('user.created');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks')
        .send({
          url: 'https://example.com/webhook',
          events: ['user.created'],
        });

      expect(response.status).toBe(401);
    });

    it('should require admin role', async () => {
      const regularUser = {
        id: 'user-123',
        email: 'user@test.com',
        passwordHash: 'hashed',
        firstName: 'Regular',
        lastName: 'User',
        dateOfBirth: new Date('1990-01-01'),
        role: 'family_member',
        userType: UserType.INDIVIDUAL,
        familyId: null,
        isActive: true,
      };

      const userToken = generateToken({
        id: regularUser.id,
        email: regularUser.email,
        role: regularUser.role,
        userType: regularUser.userType,
        familyId: regularUser.familyId,
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(regularUser);

      const response = await request(app)
        .post('/api/v1/webhooks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          url: 'https://example.com/webhook',
          events: ['user.created'],
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/v1/webhooks', () => {
    it('should list all webhooks', async () => {
      const mockWebhooks = [
        {
          id: 'webhook-1',
          url: 'https://example.com/webhook',
          events: ['user.created'],
          secret: 'test-secret',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (prisma.webhook.findMany as jest.Mock).mockResolvedValue(mockWebhooks);

      const response = await request(app)
        .get('/api/v1/webhooks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});

