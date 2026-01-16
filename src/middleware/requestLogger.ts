import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const requestId = req.id || 'unknown';
    
    const logData = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    };

    if (res.statusCode >= 500) {
      logger.error(logData, 'Request error');
    } else if (res.statusCode >= 400) {
      logger.warn(logData, 'Request warning');
    } else {
      logger.info(logData, 'Request completed');
    }
  });

  next();
};

