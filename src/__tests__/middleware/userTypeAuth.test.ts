import { Response, NextFunction } from 'express';
import { authorizeUserType } from '../../middleware/userTypeAuth';
import { AuthRequest } from '../../middleware/auth';
import { UserType } from '@prisma/client';

describe('authorizeUserType Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  it('should allow access for authorized user types', () => {
    mockReq = {
      user: {
        id: 'user-1',
        email: 'admin@example.com',
        role: 'admin',
        userType: UserType.ADMIN,
      },
    };

    const middleware = authorizeUserType(UserType.ADMIN, UserType.PROFESSIONAL);
    middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should deny access for unauthorized user types', () => {
    mockReq = {
      user: {
        id: 'user-1',
        email: 'user@example.com',
        role: 'family_member',
        userType: UserType.INDIVIDUAL,
      },
    };

    const middleware = authorizeUserType(UserType.ADMIN, UserType.PROFESSIONAL);
    middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Insufficient user type permissions',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should deny access if user is not authenticated', () => {
    mockReq = {};

    const middleware = authorizeUserType(UserType.ADMIN);
    middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Authentication required',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});

