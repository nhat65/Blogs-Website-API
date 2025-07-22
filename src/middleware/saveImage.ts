import { Request, Response, NextFunction } from 'express';
import upload from '../config/multer';

export const saveImage = (fieldName: string = 'image') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadMiddleware = upload.single(fieldName);
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image uploaded' });
      }
      req.body.imageUrl = `/uploads/${req.file.filename}`;
      next();
    });
  };
};
