import { Response, NextFunction } from 'express';
import { HealthProfileController } from '../../controllers/healthProfile.controller';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';
import { UserType } from '@prisma/client';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    healthProfile: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('HealthProfileController', () => {
  let controller: HealthProfileController;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    controller = new HealthProfileController();
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

  describe('getMyProfile', () => {
    it('should return user health profile', async () => {
      const mockProfile = {
        id: 'profile-123',
        userId: '123',
        bloodType: 'O+',
        height: 175.5,
        weight: 70.0,
        allergies: ['Peanuts'],
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      (prisma.healthProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);

      await controller.getMyProfile(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.healthProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: '123' },
        include: { user: expect.any(Object) },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockProfile,
      });
    });

    it('should return 404 if profile not found', async () => {
      (prisma.healthProfile.findUnique as jest.Mock).mockResolvedValue(null);

      await controller.getMyProfile(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('create', () => {
    it('should create a health profile', async () => {
      const profileData = {
        userId: '123',
        bloodType: 'O+',
        height: 175.5,
        weight: 70.0,
        allergies: ['Peanuts'],
        chronicConditions: [],
        medications: ['Vitamin D'],
      };

      mockRequest.body = profileData;

      const mockCreated = {
        id: 'profile-123',
        ...profileData,
      };

      (prisma.healthProfile.create as jest.Mock).mockResolvedValue(mockCreated);

      await controller.create(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.healthProfile.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
  });

  describe('update', () => {
    it('should update health profile', async () => {
      mockRequest.params = { id: 'profile-123' };
      mockRequest.body = {
        bloodType: 'A+',
        height: 180.0,
        weight: 75.0,
      };

      const mockExisting = {
        id: 'profile-123',
        userId: '123',
        user: { familyId: null },
      };
      const mockUpdated = {
        id: 'profile-123',
        bloodType: 'A+',
        height: 180.0,
        weight: 75.0,
      };

      (prisma.healthProfile.findUnique as jest.Mock).mockResolvedValue(mockExisting);
      (prisma.healthProfile.update as jest.Mock).mockResolvedValue(mockUpdated);

      await controller.update(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.healthProfile.findUnique).toHaveBeenCalled();
      expect(prisma.healthProfile.update).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });
});

