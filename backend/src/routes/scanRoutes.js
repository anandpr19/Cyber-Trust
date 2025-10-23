const express = require('express');
const router = express.Router();
const { scanByUrl, getCached } = require('../controllers/scanController');

router.post('/url', scanByUrl);       // { url: "chrome web store url" }
router.get('/cached/:id', getCached); // get cached results by extension id

module.exports = router;
