import { notificationQueue } from './queue.service';
import { notificationService } from './notification.service';
import { NotificationData } from '../types/notification.types';

notificationQueue.process('send-notification', async (job) => {
  const data: NotificationData = job.data;

  switch (data.notificationType) {
    case 'push':
      return await notificationService.sendPushNotification(data);
    case 'email':
      return await notificationService.sendEmail(data);
    case 'sms':
      return await notificationService.sendSMS(data);
    default:
      throw new Error(`Unknown notification type: ${data.notificationType}`);
  }
});

