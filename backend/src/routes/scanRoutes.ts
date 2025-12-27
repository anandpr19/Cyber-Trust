import { Router } from 'express';
import multer from 'multer';
import { handleUpload } from '../controllers/uploadController';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/x-crx' || file.originalname.endsWith('.crx')) {
      cb(null, true);
    } else {
      cb(new Error('Only .crx files are accepted'));
    }
  }
});

router.post('/', upload.single('file'), handleUpload);
export default router;