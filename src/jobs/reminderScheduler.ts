import * as cron from 'node-cron';
import { reminderService } from '../services/reminder.service';
import { logger } from '../config/logger';

let cronTask: cron.ScheduledTask | null = null;

let schedulerErrorLogged = false;

export const startReminderScheduler = (): void => {
  cronTask = cron.schedule('* * * * *', async () => {
    try {
      await reminderService.processScheduledReminders();
      // Reset error flag on success
      if (schedulerErrorLogged) {
        schedulerErrorLogged = false;
      }
    } catch (error: any) {
      // Log database connection errors only once to avoid spam
      const isDbError = error?.name === 'PrismaClientInitializationError' || 
                       error?.message?.includes('Can\'t reach database server');
      
      if (isDbError && !schedulerErrorLogged) {
        logger.error({ 
          error: {
            name: error?.name,
            message: error?.message,
            code: error?.code
          }
        }, 'Database connection error in reminder scheduler. Verify DATABASE_URL in .env');
        schedulerErrorLogged = true;
      } else if (!isDbError) {
        logger.error({ error }, 'Error in reminder scheduler');
      }
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
