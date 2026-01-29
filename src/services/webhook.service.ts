import crypto from 'crypto';
import prisma from '../config/database';
import { logger } from '../config/logger';
import { Prisma } from '@prisma/client';

export interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export class WebhookService {
  async triggerWebhook(event: string, data: Record<string, unknown>): Promise<void> {
    try {
      const webhooks = await prisma.webhook.findMany({
        where: {
          isActive: true,
          events: {
            has: event,
          },
        },
      });

      if (webhooks.length === 0) {
        return;
      }

      const payload: WebhookPayload = {
        event,
        data,
        timestamp: new Date().toISOString(),
      };

      const promises = webhooks.map((webhook) => this.sendWebhook(webhook, payload));
      await Promise.allSettled(promises);
    } catch (error) {
      logger.error({ error, event }, 'Error triggering webhooks');
    }
  }

  private async sendWebhook(webhook: { id: string; url: string; secret: string | null }, payload: WebhookPayload): Promise<void> {
    try {
      const signature = webhook.secret
        ? this.generateSignature(JSON.stringify(payload), webhook.secret)
        : null;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Event': payload.event,
        'X-Webhook-Timestamp': payload.timestamp,
      };

      if (signature) {
        headers['X-Webhook-Signature'] = signature;
      }

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      const responseBody = await response.text().catch(() => '');

      await prisma.webhookLog.create({
        data: {
          webhookId: webhook.id,
          event: payload.event,
          payload: payload as unknown as Prisma.InputJsonValue,
          responseStatus: response.status,
          responseBody: responseBody.substring(0, 1000), // Limit size
          triggeredAt: new Date(),
        },
      });

      await prisma.webhook.update({
        where: { id: webhook.id },
        data: { lastTriggeredAt: new Date() },
      });

      if (!response.ok) {
        logger.warn({ webhookId: webhook.id, status: response.status }, 'Webhook request failed');
      }
    } catch (error: unknown) {
      await prisma.webhookLog.create({
        data: {
          webhookId: webhook.id,
          event: payload.event,
          payload: payload as unknown as Prisma.InputJsonValue,
          error: error instanceof Error ? error.message.substring(0, 500) : String(error).substring(0, 500),
          triggeredAt: new Date(),
        },
      });

      logger.error({ error, webhookId: webhook.id }, 'Error sending webhook');
    }
  }

  private generateSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  async verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

export const webhookService = new WebhookService();

