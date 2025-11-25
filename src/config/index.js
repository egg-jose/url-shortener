const dotenv = require('dotenv');
dotenv.config();

const env = process.env.NODE_ENV || 'development';

const config = {
    development: {
        db: 'mongodb://localhost/urlShortener',
        baseUrl: `http://localhost:${process.env.PORT || 5000}`,
    },
    production: {
        db: process.env.MONGO_URI,
        baseUrl: process.env.APP_BASE_URL,
    },
};

module.exports = config[env];
