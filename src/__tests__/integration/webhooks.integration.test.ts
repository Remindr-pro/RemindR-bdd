import request from 'supertest';
import app from '../../server';
import prisma from '../../config/database';
import { generateToken } from '../../utils/jwt';
import { UserType } from '@prisma/client';

describe('Webhooks Integration', () => {
  let adminToken: string;
  let adminUser: any;

  beforeAll(async () => {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        passwordHash: 'hashed',
        firstName: 'Admin',
        lastName: 'User',
        dateOfBirth: new Date('1990-01-01'),
        role: 'admin',
        userType: UserType.ADMIN,
      },
    });

    adminToken = generateToken({
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      userType: adminUser.userType,
    });
  });

  afterAll(async () => {
    await prisma.webhook.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('POST /api/v1/webhooks', () => {
    it('should create a webhook with valid data', async () => {
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
      const regularUser = await prisma.user.create({
        data: {
          email: 'user@test.com',
          passwordHash: 'hashed',
          firstName: 'Regular',
          lastName: 'User',
          dateOfBirth: new Date('1990-01-01'),
          role: 'family_member',
          userType: UserType.INDIVIDUAL,
        },
      });

      const userToken = generateToken({
        id: regularUser.id,
        email: regularUser.email,
        role: regularUser.role,
        userType: regularUser.userType,
      });

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
      await prisma.webhook.create({
        data: {
          url: 'https://example.com/webhook',
          events: ['user.created'],
        },
      });

      const response = await request(app)
        .get('/api/v1/webhooks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});

