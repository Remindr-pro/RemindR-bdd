import { Request, Response, NextFunction } from 'express';
import { UserController } from '../../controllers/user.controller';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';
import { UserType } from '@prisma/client';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('UserController', () => {
  let userController: UserController;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    userController = new UserController();
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
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'family_member',
          isActive: true,
        },
        {
          id: '2',
          email: 'user2@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'family_member',
          isActive: true,
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      await userController.getAll(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
      });
    });
  });

  describe('getById', () => {
    it('should return a user by id', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        dateOfBirth: new Date('1990-01-01'),
        role: 'family_member',
        isActive: true,
      };

      mockRequest.params = { id: '123' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await userController.getById(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        select: expect.any(Object),
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it('should return 404 if user not found', async () => {
      mockRequest.params = { id: '999' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await userController.getById(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
      });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+0987654321',
      };

      mockRequest.params = { id: '123' };
      mockRequest.body = updateData;

      const mockUpdatedUser = {
        id: '123',
        email: 'test@example.com',
        ...updateData,
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      await userController.update(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: updateData,
        select: expect.any(Object),
      });
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      mockRequest.params = { id: '123' };

      await userController.delete(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User deleted successfully',
      });
    });
  });
});

