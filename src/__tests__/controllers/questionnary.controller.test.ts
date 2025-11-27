import { Request, Response, NextFunction } from 'express';
import { QuestionnaryController } from '../../controllers/questionnary.controller';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';
import { UserType } from '@prisma/client';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    questionnary: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('QuestionnaryController', () => {
  let controller: QuestionnaryController;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    controller = new QuestionnaryController();
    mockRequest = {
      user: {
        id: '123',
        email: 'test@example.com',
        role: 'family_member',
        userType: UserType.INDIVIDUAL,
        familyId: null,
      },
      params: {},
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('getMyQuestionnary', () => {
    it('should return user questionnary', async () => {
      const mockQuestionnary = {
        id: 'q-123',
        userId: '123',
        step: 5,
        nbPersonsFollowed: 1,
        enabledReminderTypes: ['medication'],
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      (prisma.questionnary.findUnique as jest.Mock).mockResolvedValue(mockQuestionnary);

      await controller.getMyQuestionnary(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.questionnary.findUnique).toHaveBeenCalledWith({
        where: { userId: '123' },
        include: { user: expect.any(Object) },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockQuestionnary,
      });
    });

    it('should return 404 if questionnary not found', async () => {
      (prisma.questionnary.findUnique as jest.Mock).mockResolvedValue(null);

      await controller.getMyQuestionnary(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('create', () => {
    it('should create a questionnary', async () => {
      const questionnaryData = {
        userId: '123',
        step: 1,
        nbPersonsFollowed: 1,
        enabledReminderTypes: ['medication'],
        enabledNotificationChannels: ['push'],
      };

      mockRequest.body = questionnaryData;

      const mockCreated = {
        id: 'q-123',
        ...questionnaryData,
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      (prisma.questionnary.create as jest.Mock).mockResolvedValue(mockCreated);

      await controller.create(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.questionnary.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
  });

  describe('update', () => {
    it('should update questionnary', async () => {
      mockRequest.params = { id: 'q-123' };
      mockRequest.body = {
        step: 6,
        enabledNotificationChannels: ['push', 'email'],
      };

      const mockUpdated = {
        id: 'q-123',
        step: 6,
        enabledNotificationChannels: ['push', 'email'],
      };

      (prisma.questionnary.update as jest.Mock).mockResolvedValue(mockUpdated);

      await controller.update(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.questionnary.update).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });
});

