const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const API_VERSION = process.env.API_VERSION || 'v1';
const basePath = `/api/${API_VERSION}`;
const port = process.env.PORT || 5000;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SurveyMage API',
      version: '1.0.0',
      description: `Survey builder and response collection API.

**Protected endpoints (Surveys)** require authentication:
1. Sign in at http://localhost:3000
2. Click the **API Token** button in the navbar (dev mode) to copy your token
3. Click **Authorize** (lock icon above) and paste the token
4. Try the request again

**Public endpoints** (no padlock, no auth):
- **GET /surveys/public/{id}** - In Surveys section; scroll down to see it. Fetch any survey by ID for public viewing.
- **Responses** section - checkSubmission, submitResponse. Use "Try it out" directly.

**GET /surveys/{id}** (auth) - Only returns surveys you created. Call GET /surveys first to get your survey IDs. Use the raw ObjectId (24 hex chars, e.g. 507f1f77bcf86cd799439011), not ObjectId("...").`
    },
    servers: [
      { url: `http://localhost:${port}${basePath}`, description: 'Local' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'Firebase ID Token',
          description: 'Firebase ID token. Sign in at http://localhost:3000 and click "API Token" in the navbar to copy.'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [path.join(__dirname, '../routes/*.js')]
};

module.exports = swaggerJsdoc(options);
