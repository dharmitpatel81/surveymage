const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const surveyRoutes = require('./routes/surveyRoutes');
const responseRoutes = require('./routes/responseRoutes');
const { publicLimiter } = require('./middleware/rateLimit');
const apiRes = require('./utils/apiResponse');
const logger = require('./utils/logger');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();
const API_VERSION = process.env.API_VERSION || 'v1';

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.use((req, res, next) => {
  logger.request(req.method, req.path);
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true
  }
}));

app.get('/', (req, res) => {
  res.json({
    message: 'SurveyMage API',
    version: '1.0.0',
    apiVersion: API_VERSION,
    status: 'running',
    docs: '/api-docs'
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'SurveyMage API',
    basePath: `/api/${API_VERSION}`,
    docs: '/api-docs'
  });
});

const apiInfo = {
  message: 'SurveyMage API',
  version: '1.0.0',
  apiVersion: API_VERSION,
  status: 'running',
  endpoints: {
    surveys: `/api/${API_VERSION}/surveys`,
    responses: `/api/${API_VERSION}/responses`
  },
  docs: '/api-docs'
};
app.get(`/api/${API_VERSION}`, (req, res) => res.json(apiInfo));
app.get(`/api/${API_VERSION}/`, (req, res) => res.json(apiInfo));

app.get('/health', (req, res) => {
  const mongo = mongoose.connection.readyState === 1;
  const status = mongo ? 'ok' : 'degraded';
  res.status(status === 'ok' ? 200 : 503).json({ status, mongo, firebase: true });
});

const apiPrefix = `/api/${API_VERSION}`;
app.use(`${apiPrefix}/surveys`, surveyRoutes);
app.use(`${apiPrefix}/responses`, publicLimiter, responseRoutes);

app.use((req, res) => {
  logger.warn('Route not found', { path: req.path });
  apiRes.error(res, 'NOT_FOUND', 'Route not found', 404);
});

app.use((err, req, res, next) => {
  logger.error('Server error', { error: err.message, stack: err.stack });
  apiRes.error(res, 'SERVER_ERROR', err.message || 'Something went wrong', 500);
});

module.exports = app;
