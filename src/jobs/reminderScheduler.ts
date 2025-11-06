import * as cron from 'node-cron';
import { reminderService } from '../services/reminder.service';

// Run every minute to check for reminders
export const startReminderScheduler = () => {
  cron.schedule('* * * * *', async () => {
    console.log('Checking for scheduled reminders...');
    await reminderService.processScheduledReminders();
  });

  console.log('✅ Reminder scheduler started');
};

