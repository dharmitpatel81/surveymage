require('dotenv').config();

const mongoose = require('mongoose');
const { validateEnv } = require('./utils/envValidation');
const app = require('./app');
const logger = require('./utils/logger');

validateEnv();

const PORT = process.env.PORT || 5000;
const API_VERSION = process.env.API_VERSION || 'v1';

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`, {
        env: process.env.NODE_ENV || 'development',
        apiPrefix: `/api/${API_VERSION}`
      });
    });
  })
  .catch((error) => {
    logger.error('MongoDB connection failed', { error: error.message });
    process.exit(1);
  });

process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});
