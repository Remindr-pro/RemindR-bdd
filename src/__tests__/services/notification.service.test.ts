import { notificationService } from '../../services/notification.service';
import { NotificationData } from '../../types/notification.types';
import prisma from '../../config/database';
import admin from 'firebase-admin';
import sgMail from '@sendgrid/mail';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    notificationLog: {
      create: jest.fn(),
    },
  },
}));

jest.mock('firebase-admin', () => ({
  __esModule: true,
  default: {
    apps: [{ name: 'default' }],
    messaging: jest.fn(() => ({
      send: jest.fn(),
    })),
  },
}));

jest.mock('@sendgrid/mail', () => ({
  __esModule: true,
  default: {
    setApiKey: jest.fn(),
    send: jest.fn(),
  },
}));

jest.mock('twilio', () => {
  return jest.fn(() => ({
    messages: {
      create: jest.fn(),
    },
  }));
});

describe('NotificationService', () => {
  const mockNotificationData: NotificationData = {
    userId: '123',
    reminderId: 'reminder-123',
    notificationType: 'push',
    title: 'Test Notification',
    message: 'Test message',
    fcmToken: 'fcm-token-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SENDGRID_API_KEY = 'test-key';
    process.env.TWILIO_ACCOUNT_SID = 'test-sid';
    process.env.TWILIO_AUTH_TOKEN = 'test-token';
    process.env.TWILIO_PHONE_NUMBER = '+1234567890';
  });

  describe('sendPushNotification', () => {
    it('should send push notification successfully', async () => {
      const mockSend = jest.fn().mockResolvedValue({});
      (admin.messaging as jest.Mock).mockReturnValue({
        send: mockSend,
      });

      const result = await notificationService.sendPushNotification(mockNotificationData);

      expect(mockSend).toHaveBeenCalledWith({
        notification: {
          title: mockNotificationData.title,
          body: mockNotificationData.message,
        },
        token: mockNotificationData.fcmToken,
      });
      expect(result).toBe(true);
      expect(prisma.notificationLog.create).toHaveBeenCalled();
    });

    it('should return false if FCM not configured', async () => {
      (admin.apps as any) = [];

      const result = await notificationService.sendPushNotification(mockNotificationData);

      expect(result).toBe(false);
    });

    it('should handle FCM errors gracefully', async () => {
      (admin.apps as any) = [{ name: 'default' }];
      
      const mockSend = jest.fn().mockRejectedValue(new Error('FCM error'));
      (admin.messaging as jest.Mock).mockReturnValue({
        send: mockSend,
      });

      const result = await notificationService.sendPushNotification(mockNotificationData);

      expect(result).toBe(false);
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const emailData: NotificationData = {
        ...mockNotificationData,
        notificationType: 'email',
        email: 'test@example.com',
      };

      (sgMail.send as jest.Mock).mockResolvedValue({});

      const result = await notificationService.sendEmail(emailData);

      expect(sgMail.send).toHaveBeenCalled();
      expect(result).toBe(true);
      expect(prisma.notificationLog.create).toHaveBeenCalled();
    });

    it('should return false if SendGrid not configured', async () => {
      delete process.env.SENDGRID_API_KEY;

      const result = await notificationService.sendEmail({
        ...mockNotificationData,
        notificationType: 'email',
        email: 'test@example.com',
      });

      expect(result).toBe(false);
    });
  });

  describe('sendSMS', () => {
    it('should send SMS successfully when configured', async () => {
      const smsData: NotificationData = {
        ...mockNotificationData,
        notificationType: 'sms',
        phoneNumber: '+1234567890',
      };

      const result = await notificationService.sendSMS(smsData);
      
      expect(typeof result).toBe('boolean');
    });

    it('should return false if Twilio not configured', async () => {
      const originalEnv = {
        TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
        TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
      };
      
      delete process.env.TWILIO_ACCOUNT_SID;
      delete process.env.TWILIO_AUTH_TOKEN;
      delete process.env.TWILIO_PHONE_NUMBER;
      
      const result = await notificationService.sendSMS({
        ...mockNotificationData,
        notificationType: 'sms',
        phoneNumber: '+1234567890',
      });

      Object.assign(process.env, originalEnv);

      expect(result).toBe(false);
    });
  });
});

