const express = require('express');
const router = express.Router();
const multer = require('multer');
const { handleUpload } = require('../controllers/uploadController');

// memory storage (no disk)
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // limit 10MB

router.post('/upload', upload.single('file'), handleUpload);

module.exports = router;
