import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { captureException } from '../config/sentry';
import { logger } from '../config/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: ApiError | ZodError | Prisma.PrismaClientKnownRequestError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.issues.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'Duplicate entry',
        field: err.meta?.target,
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Record not found',
      });
      return;
    }
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.message.includes("Can't reach database server")) {
      res.status(503).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
          ? 'Database server is not available' 
          : 'Database server is not available. Please start PostgreSQL with: npm run postgres:start',
      });
      return;
    }
    if (err.message.includes('Authentication failed')) {
      res.status(503).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
          ? 'Database authentication failed'
          : 'Database authentication failed. Please check your DATABASE_URL in .env file. It should match: postgresql://remindr:remindr_password@localhost:5432/remindr_db?schema=public',
      });
      return;
    }
  }

  const statusCode = (err as ApiError).statusCode || 500;
  const message = err.message || 'Internal server error';

  logger.error({ err, statusCode, requestId: _req.id }, 'Request error');

  if (statusCode >= 500) {
    captureException(err, {
      tags: {
        statusCode,
        errorCode: (err as ApiError).code,
        requestId: _req.id,
      },
      extra: {
        url: _req.url,
        method: _req.method,
        body: _req.body,
        requestId: _req.id,
      },
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

