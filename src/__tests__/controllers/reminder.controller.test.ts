import { Request, Response, NextFunction } from 'express';
import { ReminderController } from '../../controllers/reminder.controller';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';
import { UserType } from '@prisma/client';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    reminder: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('ReminderController', () => {
  let reminderController: ReminderController;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    reminderController = new ReminderController();
    mockRequest = {
      user: {
        id: '123',
        email: 'test@example.com',
        role: 'family_member',
        userType: UserType.INDIVIDUAL,
        familyId: null,
      },
      body: {},
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all reminders for the user', async () => {
      const mockReminders = [
        {
          id: '1',
          userId: '123',
          title: 'Test Reminder',
          isActive: true,
          type: { name: 'Medication' },
        },
      ];

      (prisma.reminder.findMany as jest.Mock).mockResolvedValue(mockReminders);

      await reminderController.getAll(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.reminder.findMany).toHaveBeenCalledWith({
        where: { userId: '123' },
        include: { type: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockReminders,
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await reminderController.getAll(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });

  describe('create', () => {
    it('should create a new reminder', async () => {
      const reminderData = {
        typeId: 'type-123',
        title: 'New Reminder',
        description: 'Test description',
        scheduledTime: '09:00:00',
        recurrence: { frequency: 'daily' },
        startDate: '2024-01-01',
      };

      mockRequest.body = reminderData;

      const mockCreatedReminder = {
        id: 'new-reminder-id',
        ...reminderData,
        userId: '123',
        type: { name: 'Medication' },
      };

      (prisma.reminder.create as jest.Mock).mockResolvedValue(mockCreatedReminder);

      await reminderController.create(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.reminder.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing reminder', async () => {
      mockRequest.params = { id: 'reminder-123' };
      mockRequest.body = {
        title: 'Updated Title',
        scheduledTime: '10:00:00',
      };

      const mockUpdatedReminder = {
        id: 'reminder-123',
        title: 'Updated Title',
        scheduledTime: new Date('1970-01-01T10:00:00'),
        type: { name: 'Medication' },
      };

      (prisma.reminder.update as jest.Mock).mockResolvedValue(mockUpdatedReminder);

      await reminderController.update(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.reminder.update).toHaveBeenCalledWith({
        where: { id: 'reminder-123' },
        data: expect.objectContaining({
          title: 'Updated Title',
        }),
        include: { type: true },
      });
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a reminder', async () => {
      mockRequest.params = { id: 'reminder-123' };

      await reminderController.delete(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.reminder.delete).toHaveBeenCalledWith({
        where: { id: 'reminder-123' },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Reminder deleted successfully',
      });
    });
  });

  describe('toggleActive', () => {
    it('should toggle reminder active status', async () => {
      mockRequest.params = { id: 'reminder-123' };

      const mockReminder = {
        id: 'reminder-123',
        isActive: true,
      };

      (prisma.reminder.findUnique as jest.Mock).mockResolvedValue(mockReminder);
      (prisma.reminder.update as jest.Mock).mockResolvedValue({
        ...mockReminder,
        isActive: false,
      });

      await reminderController.toggleActive(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.reminder.update).toHaveBeenCalledWith({
        where: { id: 'reminder-123' },
        data: { isActive: false },
      });
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });
});

