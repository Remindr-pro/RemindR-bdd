import { Request, Response, NextFunction } from 'express';
import { NotificationController } from '../../controllers/notification.controller';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';
import { UserType } from '@prisma/client';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    notificationLog: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('NotificationController', () => {
  let controller: NotificationController;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    controller = new NotificationController();
    mockRequest = {
      user: {
        id: '123',
        email: 'test@example.com',
        role: 'family_member',
        userType: UserType.INDIVIDUAL,
        familyId: null,
      },
      params: {},
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all notifications for user', async () => {
      const mockNotifications = [
        {
          id: '1',
          userId: '123',
          title: 'Test Notification',
          delivered: true,
          reminder: null,
        },
      ];

      (prisma.notificationLog.findMany as jest.Mock).mockResolvedValue(mockNotifications);

      await controller.getAll(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.notificationLog.findMany).toHaveBeenCalledWith({
        where: { userId: '123' },
        include: {
          reminder: expect.any(Object),
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockNotifications,
      });
    });

    it('should handle pagination parameters', async () => {
      mockRequest.query = { limit: '20', offset: '10' };

      await controller.getAll(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.notificationLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 10,
        })
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockRequest.params = { id: 'notif-123' };

      const mockUpdated = {
        id: 'notif-123',
        clicked: true,
      };

      (prisma.notificationLog.update as jest.Mock).mockResolvedValue(mockUpdated);

      await controller.markAsRead(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.notificationLog.update).toHaveBeenCalledWith({
        where: { id: 'notif-123' },
        data: { clicked: true },
      });
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });
});

