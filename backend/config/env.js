require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico',
  CLIENT_URL: process.env.CLIENT_URL || 'https://www.kosmicowellness.com',
  BACKEND_URL: process.env.BACKEND_URL || 'https://api.kosmicowellness.com',
};
