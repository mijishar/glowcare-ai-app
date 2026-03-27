import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { analyzeSkinImage } from '../services/vision';

const router = Router();

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are supported.'));
    }
  },
});

router.post('/', (req: Request, res: Response, next: NextFunction) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: `Image is too large. Please reduce the size to under ${MAX_SIZE_MB}MB and try again.` });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const result = await analyzeSkinImage(req.file.buffer, req.file.mimetype);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
