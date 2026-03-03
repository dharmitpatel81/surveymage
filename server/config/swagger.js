const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SurveyMage API',
      version: '1.0.0',
      description: 'Survey builder and response collection API'
    },
    servers: [{ url: 'http://localhost:5000', description: 'Local' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'Firebase ID Token'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [path.join(__dirname, '../routes/*.js')]
};

module.exports = swaggerJsdoc(options);
