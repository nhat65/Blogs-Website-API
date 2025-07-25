import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './identify';

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized: No user role found',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions',
      });
      return;
    }

    next();
  };
};
