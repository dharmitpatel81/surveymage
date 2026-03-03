const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { validateEnv } = require('./utils/envValidation');
const surveyRoutes = require('./routes/surveyRoutes');
const responseRoutes = require('./routes/responseRoutes');
const { publicLimiter } = require('./middleware/rateLimit');
const apiRes = require('./utils/apiResponse');
const logger = require('./utils/logger');

validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;
const API_VERSION = process.env.API_VERSION || 'v1';

// CORS - use CORS_ORIGIN from env (required in production; defaults to localhost:3000 in dev)
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: corsOrigin,
  credentials: true
}));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Request logging
app.use((req, res, next) => {
  logger.request(req.method, req.path);
  next();
});

// Health / root
app.get('/', (req, res) => {
  res.json({
    message: 'SurveyMage API',
    version: '1.0.0',
    apiVersion: API_VERSION,
    status: 'running'
  });
});

// Health check - MongoDB (firebase init happens at startup)
app.get('/health', (req, res) => {
  const mongo = mongoose.connection.readyState === 1;
  const status = mongo ? 'ok' : 'degraded';
  res.status(status === 'ok' ? 200 : 503).json({ status, mongo, firebase: true });
});

// API routes - versioned under /api/v1 (legacy /api for backward compatibility)
const apiPrefix = `/api/${API_VERSION}`;
const apiLegacy = '/api';
app.use(`${apiPrefix}/surveys`, surveyRoutes);
app.use(`${apiPrefix}/responses`, publicLimiter, responseRoutes);
app.use(`${apiLegacy}/surveys`, surveyRoutes);
app.use(`${apiLegacy}/responses`, publicLimiter, responseRoutes);

// 404 handler
app.use((req, res) => {
  logger.warn('Route not found', { path: req.path });
  apiRes.error(res, 'NOT_FOUND', 'Route not found', 404);
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Server error', { error: err.message, stack: err.stack });
  apiRes.error(res, 'SERVER_ERROR', err.message || 'Something went wrong', 500);
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`, {
        env: process.env.NODE_ENV || 'development',
        apiPrefix
      });
    });
  })
  .catch((error) => {
    logger.error('MongoDB connection failed', { error: error.message });
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});
