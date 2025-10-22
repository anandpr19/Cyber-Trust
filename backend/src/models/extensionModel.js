const db = require('../db/db');

function getByIdAndVersion(id, version) {
  const all = db.read();
  return all.extensions.find(e => e.id === id && e.version === version) || null;
}

function getLatestById(id) {
  const all = db.read();
  const arr = all.extensions.filter(e => e.id === id);
  if (!arr.length) return null;
  // pick latest by scannedAt
  arr.sort((a,b) => new Date(b.scannedAt) - new Date(a.scannedAt));
  return arr[0];
}

function save(record) {
  const dbObj = db.read();
  dbObj.extensions = dbObj.extensions || [];
  dbObj.extensions.push(record);
  db.write(dbObj);
  return record;
}

module.exports = { getByIdAndVersion, getLatestById, save, getByIdAndVersion };
