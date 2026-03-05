import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/identify';

const storage = multer.diskStorage({
  destination: (req: AuthRequest, file, cb) => {
    const accountId = req.user?.accountId;
    if (!accountId) {
      return cb(new Error('User ID is required'), '');
    }

    const accountUploadDir = path.join(__dirname, '../uploads', `account_${accountId}`);
    if (!fs.existsSync(accountUploadDir)) {
      try {
        fs.mkdirSync(accountUploadDir, { recursive: true });
      } catch (err) {
        return cb(new Error('Failed to create user directory'), '');
      }
    }

    cb(null, accountUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error('Only images are allowed!'));
  },
});

export default upload;
