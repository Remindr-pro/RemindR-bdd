import { AuthController } from '../../controllers/auth.controller';
import prisma from '../../config/database';
import { hashPassword } from '../../utils/bcrypt';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Auth Integration Tests', () => {
  let authController: AuthController;
  let mockRequest: any;
  let mockResponse: any;
  let nextFunction: jest.Mock;

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

  it('should complete full registration and login flow', async () => {
    const registerData = {
      email: 'integration@test.com',
      password: 'password123',
      firstName: 'Integration',
      lastName: 'Test',
      dateOfBirth: '1990-01-01',
    };

    mockRequest.body = registerData;

    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const createdUser = {
      id: 'user-123',
      email: registerData.email,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      role: 'family_member',
      familyId: null,
    };
    (prisma.user.create as jest.Mock).mockResolvedValue(createdUser);

    await authController.register(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          user: createdUser,
          token: expect.any(String),
          refreshToken: expect.any(String),
        }),
      })
    );

    const loginData = {
      email: registerData.email,
      password: registerData.password,
    };

    mockRequest.body = loginData;

    const hashedPassword = await hashPassword(registerData.password);
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
      ...createdUser,
      passwordHash: hashedPassword,
      isActive: true,
    });

    await authController.login(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Login successful',
        data: expect.objectContaining({
          user: expect.objectContaining({
            email: registerData.email,
          }),
          token: expect.any(String),
          refreshToken: expect.any(String),
        }),
      })
    );
  });

  it('should handle registration with existing email', async () => {
    const registerData = {
      email: 'existing@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '1990-01-01',
    };

    mockRequest.body = registerData;

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'existing-user',
      email: registerData.email,
    });

    await authController.register(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'User with this email already exists',
    });
  });
});

