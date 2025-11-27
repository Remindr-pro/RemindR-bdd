import { Request, Response, NextFunction } from 'express';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

describe('Validate Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
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

  it('should call next() when validation passes', async () => {
    const schema = z.object({
      body: z.object({
        email: z.string().email(),
        name: z.string(),
      }),
    });

    mockRequest.body = {
      email: 'test@example.com',
      name: 'Test User',
    };

    const middleware = validate(schema);
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should return 400 when validation fails', async () => {
    const schema = z.object({
      body: z.object({
        email: z.string().email(),
        name: z.string(),
      }),
    });

    mockRequest.body = {
      email: 'invalid-email',
      name: 'Test User',
    };

    const middleware = validate(schema);
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validation error',
      errors: expect.arrayContaining([
        expect.objectContaining({
          path: expect.any(String),
          message: expect.any(String),
        }),
      ]),
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should validate params', async () => {
    const schema = z.object({
      params: z.object({
        id: z.string().uuid(),
      }),
    });

    mockRequest.params = {
      id: '123e4567-e89b-12d3-a456-426614174000',
    };

    const middleware = validate(schema);
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
  });

  it('should validate query parameters', async () => {
    const schema = z.object({
      query: z.object({
        page: z.string().transform(Number),
        limit: z.string().transform(Number),
      }),
    });

    mockRequest.query = {
      page: '1',
      limit: '10',
    };

    const middleware = validate(schema);
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
  });
});

