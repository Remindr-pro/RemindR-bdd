import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const id = req.headers['x-request-id'] as string || randomUUID();
  req.id = id;
  res.setHeader('X-Request-ID', id);
  next();
};
