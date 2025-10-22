// src/utils/crxToZip.js
const fs = require("fs");

// Converts CRX (v2 or v3) → ZIP buffer
function crxToZip(crxPath) {
  const buffer = fs.readFileSync(crxPath);

  // Check CRX magic number
  if (buffer.toString("utf8", 0, 4) !== "Cr24") {
    throw new Error("Invalid CRX magic header");
  }

  const version = buffer.readUInt32LE(4);
  let zipStartOffset;

  if (version === 2) {
    const publicKeyLength = buffer.readUInt32LE(8);
    const signatureLength = buffer.readUInt32LE(12);
    zipStartOffset = 16 + publicKeyLength + signatureLength;
  } else if (version === 3) {
    const headerSize = buffer.readUInt32LE(8);
    zipStartOffset = 12 + headerSize;
  } else {
    throw new Error(`Unknown CRX version: ${version}`);
  }

  return buffer.slice(zipStartOffset);
}

module.exports = crxToZip;
