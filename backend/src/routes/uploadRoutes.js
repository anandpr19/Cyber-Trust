const express = require('express');
const multer = require('multer');
const { handleUpload } = require('../controllers/uploadController');

const router = express.Router();

// Memory storage - no disk writes
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Accept .crx files
    if (file.mimetype === 'application/x-crx' || file.originalname.endsWith('.crx')) {
      cb(null, true);
    } else {
      cb(new Error('Only .crx files are accepted'), false);
    }
  }
});

router.post('/', upload.single('file'), handleUpload);

module.exports = router;
