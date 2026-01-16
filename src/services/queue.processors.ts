import Queue from 'bull';
import { notificationQueue, reminderQueue } from './queue.service';
import { notificationService } from './notification.service';
import { reminderService } from './reminder.service';
import { NotificationData } from '../types/notification.types';
import { logger } from '../config/logger';

if (notificationQueue) {
  notificationQueue.process('send-notification', async (job: Queue.Job<NotificationData>) => {
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
}

if (reminderQueue) {
  reminderQueue.process('process-reminders', async (_job: Queue.Job) => {
    try {
      await reminderService.processScheduledReminders();
      logger.debug('Reminder queue job completed');
    } catch (error) {
      logger.error({ error }, 'Error processing reminders from queue');
      throw error;
    }
  });

  reminderQueue.add('process-reminders', {}, {
    repeat: {
      cron: '* * * * *', // Every minute
    },
    removeOnComplete: true,
    removeOnFail: false,
  });
}
