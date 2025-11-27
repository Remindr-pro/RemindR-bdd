import * as cron from 'node-cron';
import { reminderService } from '../services/reminder.service';

export const startReminderScheduler = () => {
  cron.schedule('* * * * *', async () => {
    await reminderService.processScheduledReminders();
  });
};

