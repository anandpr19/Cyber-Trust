const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { handleUpload } = require('../controllers/uploadController');

const router = express.Router();
// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post('/', upload.single('extensionZip'), handleUpload);

module.exports = router;
