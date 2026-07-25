import multer from 'multer';
import { BadRequestError } from '../utils/errors';

// Store files in memory buffer to process via Sharp before writing to disk
const storage = multer.memoryStorage();

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only image files (JPEG, PNG, WEBP) are allowed') as any, false);
  }
};

export const uploadRoomImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 10, // 10 files max per upload batch
  },
});
