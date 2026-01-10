// Vercel Serverless Function entry point for Express backend
// This file bridges the Express app to Vercel's serverless runtime

require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });

const app = require('../backend/app');

module.exports = app;
