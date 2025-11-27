import { Request, Response, NextFunction } from 'express';
import { FamilyController } from '../../controllers/family.controller';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    family: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('FamilyController', () => {
  let controller: FamilyController;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    controller = new FamilyController();
    mockRequest = {
      user: {
        id: '123',
        email: 'test@example.com',
        role: 'family_member',
        familyId: 'family-123',
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

  describe('getMyFamily', () => {
    it('should return user family', async () => {
      const mockFamily = {
        id: 'family-123',
        familyName: 'Doe Family',
        users: [
          {
            id: '123',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
          },
        ],
        insuranceCompany: {
          id: 'ins-123',
          name: 'Health Insurance',
        },
      };

      (prisma.family.findUnique as jest.Mock).mockResolvedValue(mockFamily);

      await controller.getMyFamily(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.family.findUnique).toHaveBeenCalledWith({
        where: { id: 'family-123' },
        include: {
          insuranceCompany: true,
          users: expect.any(Object),
        },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockFamily,
      });
    });

    it('should return 404 if user has no family', async () => {
      mockRequest.user!.familyId = null;

      await controller.getMyFamily(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('update', () => {
    it('should update family', async () => {
      mockRequest.params = { id: 'family-123' };
      mockRequest.body = {
        familyName: 'Updated Family Name',
        subscriptionStatus: 'active',
      };

      const mockUpdated = {
        id: 'family-123',
        familyName: 'Updated Family Name',
        subscriptionStatus: 'active',
        insuranceCompany: null,
      };

      (prisma.family.update as jest.Mock).mockResolvedValue(mockUpdated);

      await controller.update(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.family.update).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });
});

