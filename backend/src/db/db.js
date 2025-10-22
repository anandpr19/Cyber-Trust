const fs = require('fs');
const path = require('path');
const { DB_FILE } = require('../config');

function ensureDbFile() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ extensions: [] }, null, 2));
  }
}

function read() {
  ensureDbFile();
  const raw = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(raw);
}

function write(obj) {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(obj, null, 2), 'utf8');
}

module.exports = { read, write };
