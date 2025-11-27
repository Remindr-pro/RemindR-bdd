import { Request, Response, NextFunction } from 'express';
import { RecommendationController } from '../../controllers/recommendation.controller';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';
import { UserType } from '@prisma/client';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    recommendation: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('RecommendationController', () => {
  let controller: RecommendationController;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    controller = new RecommendationController();
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

  describe('getAll', () => {
    it('should return all recommendations for user', async () => {
      const mockRecommendations = [
        {
          id: '1',
          userId: '123',
          title: 'Test Recommendation',
          priority: 1,
          isDismissed: false,
          partner: null,
          article: null,
        },
      ];

      (prisma.recommendation.findMany as jest.Mock).mockResolvedValue(mockRecommendations);

      await controller.getAll(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.recommendation.findMany).toHaveBeenCalledWith({
        where: {
          userId: '123',
          isDismissed: false,
        },
        include: {
          partner: true,
          article: expect.any(Object),
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockRecommendations,
      });
    });

    it('should return 401 if user not authenticated', async () => {
      mockRequest.user = undefined;

      await controller.getAll(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });

  describe('dismiss', () => {
    it('should dismiss a recommendation', async () => {
      mockRequest.params = { id: 'rec-123' };

      const mockDismissed = {
        id: 'rec-123',
        isDismissed: true,
        dismissedAt: new Date(),
      };

      (prisma.recommendation.update as jest.Mock).mockResolvedValue(mockDismissed);

      await controller.dismiss(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.recommendation.update).toHaveBeenCalledWith({
        where: { id: 'rec-123' },
        data: {
          isDismissed: true,
          dismissedAt: expect.any(Date),
        },
      });
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe('recordClick', () => {
    it('should record a click on recommendation', async () => {
      mockRequest.params = { id: 'rec-123' };

      const mockUpdated = {
        id: 'rec-123',
        clickedAt: new Date(),
      };

      (prisma.recommendation.update as jest.Mock).mockResolvedValue(mockUpdated);

      await controller.recordClick(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.recommendation.update).toHaveBeenCalledWith({
        where: { id: 'rec-123' },
        data: {
          clickedAt: expect.any(Date),
        },
      });
    });
  });
});

