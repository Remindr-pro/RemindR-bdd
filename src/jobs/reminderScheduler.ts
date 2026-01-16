import * as cron from 'node-cron';
import { reminderService } from '../services/reminder.service';
import { logger } from '../config/logger';

let cronTask: cron.ScheduledTask | null = null;

export const startReminderScheduler = (): void => {
  cronTask = cron.schedule('* * * * *', async () => {
    try {
      await reminderService.processScheduledReminders();
    } catch (error) {
      logger.error({ error }, 'Error in reminder scheduler');
    }
  });
  logger.info('Reminder scheduler started');
};

export const stopReminderScheduler = (): Promise<void> => {
  return new Promise((resolve) => {
    if (cronTask) {
      cronTask.stop();
      cronTask = null;
      logger.info('Reminder scheduler stopped');
    }
    resolve();
  });
};
