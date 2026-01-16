import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { UserType } from '@prisma/client';

export const authorizeUserType = (...userTypes: UserType[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!userTypes.includes(req.user.userType)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient user type permissions',
      });
      return;
    }

    next();
  };
};
