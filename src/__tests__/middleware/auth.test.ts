import { Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { generateToken } from '../../utils/jwt';
import prisma from '../../config/database';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should return 401 if no token provided', async () => {
      await authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'No token provided',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token format is invalid', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token',
      };

      await authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should authenticate user with valid token', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        role: 'family_member',
        familyId: null,
        isActive: true,
      };

      const token = generateToken({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        familyId: mockUser.familyId,
      });

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        familyId: mockUser.familyId,
      });
    });

    it('should return 401 if user is inactive', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        role: 'family_member',
        familyId: null,
        isActive: false,
      };

      const token = generateToken({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        familyId: mockUser.familyId,
      });

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should allow access for authorized role', () => {
      mockRequest.user = {
        id: '123',
        email: 'test@example.com',
        role: 'admin',
        familyId: null,
      };

      const authorizeAdmin = authorize('admin');
      authorizeAdmin(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should deny access for unauthorized role', () => {
      mockRequest.user = {
        id: '123',
        email: 'test@example.com',
        role: 'family_member',
        familyId: null,
      };

      const authorizeAdmin = authorize('admin');
      authorizeAdmin(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', () => {
      const authorizeAdmin = authorize('admin');
      authorizeAdmin(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});

