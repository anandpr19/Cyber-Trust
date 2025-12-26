const express = require('express');
const { scanExtension } = require('../controllers/scanController');
const router = express.Router();
router.post('/', scanExtension);

module.exports = router;