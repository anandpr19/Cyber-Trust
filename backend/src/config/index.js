const path = require('path');
module.exports = {
  PORT: process.env.PORT || 4000,
  PROD_VERSION: process.env.PROD_VERSION || '91.0',
  DB_FILE: process.env.DB_FILE || path.resolve(__dirname, '../../data/db.json')
};
