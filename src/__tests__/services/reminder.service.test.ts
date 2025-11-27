import { reminderService } from '../../services/reminder.service';
import prisma from '../../config/database';
import { notificationService } from '../../services/notification.service';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    reminder: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    questionnary: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../../services/notification.service', () => ({
  notificationService: {
    sendNotification: jest.fn(),
  },
}));

describe('ReminderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processScheduledReminders', () => {
    it('should process reminders that should be triggered', async () => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 8);

      const mockReminders = [
        {
          id: '1',
          userId: '123',
          scheduledTime: new Date(`1970-01-01T${currentTime}`),
          title: 'Test Reminder',
          description: 'Test',
          isActive: true,
          startDate: new Date('2024-01-01'),
          endDate: null,
          lastTriggeredAt: null,
          user: {
            id: '123',
            email: 'test@example.com',
            phoneNumber: '+1234567890',
          },
        },
      ];

      (prisma.reminder.findMany as jest.Mock).mockResolvedValue(mockReminders);
      (prisma.questionnary.findUnique as jest.Mock).mockResolvedValue({
        enabledNotificationChannels: ['push', 'email'],
      });
      (prisma.reminder.update as jest.Mock).mockResolvedValue({});

      (notificationService.sendNotification as jest.Mock).mockResolvedValue(true);

      await reminderService.processScheduledReminders();

      expect(prisma.reminder.findMany).toHaveBeenCalled();
    });

    it('should not process reminders that were already triggered today', async () => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 8);

      const mockReminders = [
        {
          id: '1',
          userId: '123',
          scheduledTime: new Date(`1970-01-01T${currentTime}`),
          title: 'Test Reminder',
          description: 'Test',
          isActive: true,
          startDate: new Date('2024-01-01'),
          endDate: null,
          lastTriggeredAt: now,
          user: {
            id: '123',
            email: 'test@example.com',
            phoneNumber: '+1234567890',
          },
        },
      ];

      (prisma.reminder.findMany as jest.Mock).mockResolvedValue(mockReminders);

      await reminderService.processScheduledReminders();

      expect(notificationService.sendNotification).not.toHaveBeenCalled();
    });

    it('should not process inactive reminders', async () => {
      const mockReminders = [
        {
          id: '1',
          userId: '123',
          scheduledTime: new Date('1970-01-01T09:00:00'),
          title: 'Test Reminder',
          isActive: false,
          startDate: new Date('2024-01-01'),
          endDate: null,
          user: {
            id: '123',
            email: 'test@example.com',
          },
        },
      ];

      (prisma.reminder.findMany as jest.Mock).mockResolvedValue(mockReminders);

      await reminderService.processScheduledReminders();

      expect(notificationService.sendNotification).not.toHaveBeenCalled();
    });
  });
});

