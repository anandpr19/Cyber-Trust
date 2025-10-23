const express = require('express');
const morgan = require('morgan');
const scanRoutes = require('./routes/scanRoutes');
const app = express();

app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/scan', scanRoutes);

app.get('/', (req, res) => {
  res.send({ msg: 'Cyber-Trust Backend - up. POST /api/scan/url { url }' });
});

module.exports = app;
