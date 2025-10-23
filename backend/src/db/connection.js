// src/db/connection.js
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://anandpr19:ANAND1909@cluster0.slxbfek.mongodb.net/';

function connect() {
  mongoose.set('strictQuery', false);
  return mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected to', MONGO_URI);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
}

module.exports = { connect, mongoose };
