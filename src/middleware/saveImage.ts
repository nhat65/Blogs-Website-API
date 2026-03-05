import { Request, Response, NextFunction } from 'express';
import upload from '../config/multer';
import { AuthRequest } from './identify';

export const saveImage = (fieldName: string = 'image') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const uploadMiddleware = upload.single(fieldName);
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      if (req.file) {
        const accountId = req.user?.accountId;
        req.body.imageUrl = `/uploads/account_${accountId}/${req.file.filename}`;
      }

      next();
    });
  };
};
