import { webhookService } from '../../services/webhook.service';
import prisma from '../../config/database';
import { logger } from '../../config/logger';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    webhook: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    webhookLog: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../../config/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

describe('WebhookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('triggerWebhook', () => {
    it('should trigger webhooks for a specific event', async () => {
      const mockWebhooks = [
        {
          id: 'webhook-1',
          url: 'https://example.com/webhook',
          events: ['user.created'],
          secret: 'test-secret',
          isActive: true,
        },
      ];

      (prisma.webhook.findMany as jest.Mock).mockResolvedValue(mockWebhooks);
      (prisma.webhookLog.create as jest.Mock).mockResolvedValue({});
      (prisma.webhook.update as jest.Mock).mockResolvedValue({});

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue('OK'),
      });

      await webhookService.triggerWebhook('user.created', {
        userId: 'user-1',
        email: 'test@example.com',
      });

      expect(prisma.webhook.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          events: {
            has: 'user.created',
          },
        },
      });
    });

    it('should not trigger webhooks if none are configured', async () => {
      (prisma.webhook.findMany as jest.Mock).mockResolvedValue([]);

      await webhookService.triggerWebhook('user.created', {
        userId: 'user-1',
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle webhook errors gracefully', async () => {
      const mockWebhooks = [
        {
          id: 'webhook-1',
          url: 'https://example.com/webhook',
          events: ['user.created'],
          secret: 'test-secret',
          isActive: true,
        },
      ];

      (prisma.webhook.findMany as jest.Mock).mockResolvedValue(mockWebhooks);
      (prisma.webhookLog.create as jest.Mock).mockResolvedValue({});

      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await webhookService.triggerWebhook('user.created', {
        userId: 'user-1',
      });

      expect(prisma.webhookLog.create).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('verifySignature', () => {
    it('should verify a valid signature', async () => {
      const payload = 'test payload';
      const secret = 'test-secret';
      const signature = await webhookService['generateSignature'](payload, secret);

      const isValid = await webhookService.verifySignature(payload, signature, secret);
      expect(isValid).toBe(true);
    });

    it('should reject an invalid signature', async () => {
      const payload = 'test payload';
      const secret = 'test-secret';
      const wrongSecret = 'wrong-secret';
      const signature = await webhookService['generateSignature'](payload, secret);

      const isValid = await webhookService.verifySignature(payload, signature, wrongSecret);
      expect(isValid).toBe(false);
    });
  });
});

