const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

function connect() {
  mongoose.set('strictQuery', false);
  return mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
}

module.exports = { connect, mongoose };
