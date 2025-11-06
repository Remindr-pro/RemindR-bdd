import admin from 'firebase-admin';
import sgMail from '@sendgrid/mail';
import twilio from 'twilio';
import path from 'path';
import fs from 'fs';
import prisma from '../config/database';
import { notificationQueue } from './queue.service';
import { NotificationData } from '../types/notification.types';

// Initialize Firebase Admin
if (process.env.FCM_SERVICE_ACCOUNT_PATH) {
  try {
    // Resolve the path relative to the project root
    const serviceAccountPath = path.resolve(process.cwd(), process.env.FCM_SERVICE_ACCOUNT_PATH);
    
    // Check if file exists
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`File not found: ${serviceAccountPath}`);
    }
    
    // Read and parse the JSON file
    const serviceAccountJson = fs.readFileSync(serviceAccountPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized with Service Account');
  } catch (error) {
    console.error('❌ Error loading Firebase Service Account:', error);
    console.error(`Please check that FCM_SERVICE_ACCOUNT_PATH (${process.env.FCM_SERVICE_ACCOUNT_PATH}) points to a valid JSON file`);
  }
} else if (process.env.FCM_SERVER_KEY && process.env.FCM_PROJECT_ID) {
  console.warn('⚠️  Using FCM_SERVER_KEY: Admin SDK requires Service Account for full functionality');
  admin.initializeApp({
    projectId: process.env.FCM_PROJECT_ID,
  });
} else {
  console.warn('⚠️  Firebase Cloud Messaging not configured. Set FCM_SERVICE_ACCOUNT_PATH or FCM_SERVER_KEY in .env');
}

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Initialize Twilio
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export class NotificationService {
  async sendPushNotification(data: NotificationData): Promise<boolean> {
    try {
      if (!data.fcmToken || !admin.apps.length) {
        console.warn('FCM not configured or token missing');
        return false;
      }

      const message = {
        notification: {
          title: data.title,
          body: data.message,
        },
        token: data.fcmToken,
      };

      await admin.messaging().send(message);

      await this.logNotification({
        ...data,
        delivered: true,
      });

      return true;
    } catch (error) {
      console.error('Push notification error:', error);
      await this.logNotification({
        ...data,
        delivered: false,
      });
      return false;
    }
  }

  async sendEmail(data: NotificationData): Promise<boolean> {
    try {
      if (!data.email || !process.env.SENDGRID_API_KEY) {
        console.warn('SendGrid not configured or email missing');
        return false;
      }

      const msg = {
        to: data.email,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@remindr.app',
        subject: data.title,
        text: data.message,
        html: `<p>${data.message}</p>`,
      };

      await sgMail.send(msg);

      await this.logNotification({
        ...data,
        delivered: true,
      });

      return true;
    } catch (error) {
      console.error('Email notification error:', error);
      await this.logNotification({
        ...data,
        delivered: false,
      });
      return false;
    }
  }

  async sendSMS(data: NotificationData): Promise<boolean> {
    try {
      if (!data.phoneNumber || !twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
        console.warn('Twilio not configured or phone number missing');
        return false;
      }

      await twilioClient.messages.create({
        body: `${data.title}: ${data.message}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: data.phoneNumber,
      });

      await this.logNotification({
        ...data,
        delivered: true,
      });

      return true;
    } catch (error) {
      console.error('SMS notification error:', error);
      await this.logNotification({
        ...data,
        delivered: false,
      });
      return false;
    }
  }

  async sendNotification(data: NotificationData): Promise<boolean> {
    // Queue the notification for processing
    await notificationQueue.add('send-notification', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    return true;
  }

  private async logNotification(data: NotificationData & { delivered: boolean }): Promise<void> {
    try {
      await prisma.notificationLog.create({
        data: {
          userId: data.userId,
          reminderId: data.reminderId,
          notificationType: data.notificationType,
          title: data.title,
          message: data.message,
          sentAt: new Date(),
          delivered: data.delivered,
        },
      });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }
}

export const notificationService = new NotificationService();

