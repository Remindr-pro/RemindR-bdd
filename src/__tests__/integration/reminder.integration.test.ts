import { ReminderController } from '../../controllers/reminder.controller';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';
import { Request } from 'express';
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
    reminderType: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Reminder Integration Tests', () => {
  let reminderController: ReminderController;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: any;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    reminderController = new ReminderController();
    mockRequest = {
      user: {
        id: 'user-123',
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

  it('should complete full reminder CRUD flow', async () => {
    const typeId = 'type-123';
    const reminderData = {
      typeId,
      title: 'Integration Test Reminder',
      description: 'Test description',
      scheduledTime: '09:00:00',
      recurrence: { frequency: 'daily' },
      startDate: '2026-01-01',
    };

    mockRequest.body = reminderData;
    const mockCreated = {
      id: 'reminder-123',
      userId: 'user-123',
      ...reminderData,
      isActive: true,
      type: { name: 'Medication' },
    };

    (prisma.reminder.create as jest.Mock).mockResolvedValue(mockCreated);

    await reminderController.create(
      mockRequest as AuthRequest,
      mockResponse,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    const createdId = mockCreated.id;

    (prisma.reminder.findMany as jest.Mock).mockResolvedValue([mockCreated]);

    await reminderController.getAll(
      mockRequest as AuthRequest,
      mockResponse,
      nextFunction
    );

    expect(prisma.reminder.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      include: { type: true },
      orderBy: { createdAt: 'desc' },
    });

    mockRequest.params = { id: createdId };
    (prisma.reminder.findUnique as jest.Mock).mockResolvedValue(mockCreated);

    await reminderController.getById(
      mockRequest as unknown as Request,
      mockResponse as any,
      nextFunction
    );

    expect(prisma.reminder.findUnique).toHaveBeenCalledWith({
      where: { id: createdId },
      include: expect.any(Object),
    });

    mockRequest.body = {
      title: 'Updated Title',
      scheduledTime: '10:00:00',
    };

    const mockUpdated = {
      ...mockCreated,
      title: 'Updated Title',
    };

    (prisma.reminder.update as jest.Mock).mockResolvedValue(mockUpdated);

    await reminderController.update(
      mockRequest as unknown as Request,
      mockResponse as any,
      nextFunction
    );

    expect(prisma.reminder.update).toHaveBeenCalled();

    (prisma.reminder.findUnique as jest.Mock).mockResolvedValue(mockUpdated);
    (prisma.reminder.update as jest.Mock).mockResolvedValue({
      ...mockUpdated,
      isActive: false,
    });

    await reminderController.toggleActive(
      mockRequest as unknown as Request,
      mockResponse as any,
      nextFunction
    );

    expect(prisma.reminder.update).toHaveBeenCalledWith({
      where: { id: createdId },
      data: { isActive: false },
    });
  });
});

