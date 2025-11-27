import { Request, Response, NextFunction } from 'express';
import { AuthController } from '../../controllers/auth.controller';
import prisma from '../../config/database';
import { hashPassword } from '../../utils/bcrypt';

// Mock Prisma
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock bcrypt
jest.mock('../../utils/bcrypt', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

describe('AuthController', () => {
  let authController: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    authController = new AuthController();
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUserData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
      };

      mockRequest.body = mockUserData;

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: '123',
        email: mockUserData.email,
        firstName: mockUserData.firstName,
        lastName: mockUserData.lastName,
        role: 'family_member',
        familyId: null,
      });

      await authController.register(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUserData.email },
      });
      expect(hashPassword).toHaveBeenCalledWith(mockUserData.password);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return 409 if user already exists', async () => {
      const mockUserData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
      };

      mockRequest.body = mockUserData;

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '123',
        email: mockUserData.email,
      });

      await authController.register(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'User with this email already exists',
      });
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      const mockLoginData = {
        email: 'user@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '123',
        email: mockLoginData.email,
        passwordHash: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        role: 'family_member',
        familyId: null,
        isActive: true,
      };

      mockRequest.body = mockLoginData;

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      const { comparePassword } = require('../../utils/bcrypt');
      (comparePassword as jest.Mock).mockResolvedValue(true);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockLoginData.email },
      });
      expect(comparePassword).toHaveBeenCalledWith(
        mockLoginData.password,
        mockUser.passwordHash
      );
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return 401 for invalid credentials', async () => {
      const mockLoginData = {
        email: 'user@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: '123',
        email: mockLoginData.email,
        passwordHash: 'hashedPassword',
        isActive: true,
      };

      mockRequest.body = mockLoginData;

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      const { comparePassword } = require('../../utils/bcrypt');
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials',
      });
    });
  });
});

