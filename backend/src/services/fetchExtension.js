const axios = require('axios');

exports.fetchExtensionBuffer = async (input) => {
  try {
    console.log('⚡ Fetching extension for:', input);

    let url;
    if (input.startsWith('http')) {
      url = input;
    } else {
      url = `https://clients2.google.com/service/update2/crx?response=redirect&prodversion=140.0.7339.81&x=id%3D${input}%26installsource%3Dondemand%26uc`;
    }

    console.log('🌐 Download URL:', url);

    const res = await axios.get(url, { responseType: 'arraybuffer', maxRedirects: 5 });
    let buf = Buffer.from(res.data);

    console.log('Response content-type:', res.headers['content-type']);
    console.log('Downloaded bytes:', buf.length);
    console.log('First 10 bytes (hex):', buf.slice(0, 10).toString('hex'));
    console.log('First 10 bytes (ascii):', buf.slice(0, 10).toString('ascii'));

    if (buf.slice(0, 4).toString() === 'Cr24') {
      console.log('🧩 Detected CRX format');
      const version = buf.readUInt32LE(4);
      const pubKeyLength = buf.readUInt32LE(8);
      const sigLength = buf.readUInt32LE(12);
      const headerSize = 16 + pubKeyLength + sigLength;
      console.log(`CRXv${version} header size: ${headerSize} bytes`);

      buf = buf.slice(headerSize);
    } else {
      console.log('📦 Not a CRX header, assuming ZIP or direct content');
    }

    if (buf.length < 100) {
      throw new Error('Fetched buffer too small — probably not a valid extension file');
    }

    console.log('✅ Returning clean buffer of size:', buf.length);
    return buf;

  } catch (err) {
    console.error('❌ fetchExtensionBuffer error:', err.message);
    throw new Error('Failed to fetch or convert CRX');
  }
};
