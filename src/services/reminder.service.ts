import prisma from '../config/database';
import { notificationService } from './notification.service';

export class ReminderService {
  async processScheduledReminders() {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 8);

    const reminders = await prisma.reminder.findMany({
      where: {
        isActive: true,
        startDate: {
          lte: now,
        },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
      include: {
        user: true,
      },
    });

    for (const reminder of reminders) {
      const scheduledTime = reminder.scheduledTime.toTimeString().slice(0, 8);

      if (this.shouldTrigger(reminder, currentTime, scheduledTime)) {
        await this.triggerReminder(reminder);
      }
    }
  }

  private shouldTrigger(reminder: any, currentTime: string, scheduledTime: string): boolean {
    if (currentTime !== scheduledTime) {
      return false;
    }

    if (reminder.lastTriggeredAt) {
      const lastTriggered = new Date(reminder.lastTriggeredAt);
      const today = new Date();
      if (
        lastTriggered.getDate() === today.getDate() &&
        lastTriggered.getMonth() === today.getMonth() &&
        lastTriggered.getFullYear() === today.getFullYear()
      ) {
        return false;
      }
    }

    return true;
  }

  private async triggerReminder(reminder: any) {
    try {
      const questionnary = await prisma.questionnary.findUnique({
        where: { userId: reminder.userId },
      });

      const enabledChannels = questionnary?.enabledNotificationChannels || ['push'];

      for (const channel of enabledChannels) {
        if (channel === 'push') {
          await notificationService.sendNotification({
            userId: reminder.userId,
            reminderId: reminder.id,
            notificationType: 'push',
            title: reminder.title,
            message: reminder.description || reminder.title,
          });
        } else if (channel === 'email' && reminder.user.email) {
          await notificationService.sendNotification({
            userId: reminder.userId,
            reminderId: reminder.id,
            notificationType: 'email',
            title: reminder.title,
            message: reminder.description || reminder.title,
            email: reminder.user.email,
          });
        } else if (channel === 'sms' && reminder.user.phoneNumber) {
          await notificationService.sendNotification({
            userId: reminder.userId,
            reminderId: reminder.id,
            notificationType: 'sms',
            title: reminder.title,
            message: reminder.description || reminder.title,
            phoneNumber: reminder.user.phoneNumber,
          });
        }
      }

      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { lastTriggeredAt: new Date() },
      });
    } catch (error) {
      console.error(`Error triggering reminder ${reminder.id}:`, error);
    }
  }
}

export const reminderService = new ReminderService();

