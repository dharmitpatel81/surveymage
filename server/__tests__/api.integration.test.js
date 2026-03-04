const request = require('supertest');

jest.mock('../utils/logger', () => ({
  request: () => {},
  info: () => {},
  warn: () => {},
  error: () => {}
}));

jest.mock('../config/firebase', () => ({
  auth: () => ({
    verifyIdToken: () =>
      Promise.resolve({
        uid: 'test-uid',
        email: 'test@test.com',
        emailVerified: true,
        firebase: { sign_in_provider: 'password' }
      })
  })
}));

const app = require('../app');

describe('API integration', () => {
  describe('GET /', () => {
    it('returns API info', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('SurveyMage API');
      expect(res.body.status).toBe('running');
      expect(res.body.docs).toBe('/api-docs');
    });
  });

  describe('GET /api', () => {
    it('returns API base path and docs link', async () => {
      const res = await request(app).get('/api');
      expect(res.status).toBe(200);
      expect(res.body.basePath).toBe('/api/v1');
      expect(res.body.docs).toBe('/api-docs');
    });
  });

  describe('GET /api/v1', () => {
    it('returns API info and endpoints', async () => {
      const res = await request(app).get('/api/v1');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('SurveyMage API');
      expect(res.body.endpoints?.surveys).toBe('/api/v1/surveys');
      expect(res.body.docs).toBe('/api-docs');
    });
  });

  describe('POST /api/v1/responses/submitResponse', () => {
    it('rejects invalid surveyId with 400', async () => {
      const res = await request(app)
        .post('/api/v1/responses/submitResponse')
        .send({ surveyId: 'invalid', answers: [], submittedBy: 'user@test.com' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error?.code).toBe('VALIDATION');
    });

    it('rejects missing submittedBy with 400', async () => {
      const res = await request(app)
        .post('/api/v1/responses/submitResponse')
        .send({
          surveyId: '507f1f77bcf86cd799439011',
          answers: [],
          submittedBy: ''
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects non-array answers with 400', async () => {
      const res = await request(app)
        .post('/api/v1/responses/submitResponse')
        .send({
          surveyId: '507f1f77bcf86cd799439011',
          answers: 'not-array',
          submittedBy: 'user@test.com'
        });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/responses/checkSubmission', () => {
    it('rejects invalid surveyId with 400', async () => {
      const res = await request(app)
        .get('/api/v1/responses/checkSubmission')
        .query({ surveyId: 'bad', submittedBy: 'user@test.com' });
      expect(res.status).toBe(400);
    });

    it('rejects missing submittedBy with 400', async () => {
      const res = await request(app)
        .get('/api/v1/responses/checkSubmission')
        .query({ surveyId: '507f1f77bcf86cd799439011' });
      expect(res.status).toBe(400);
    });
  });

  describe('404', () => {
    it('returns 404 for unknown route', async () => {
      const res = await request(app).get('/api/v1/unknown');
      expect(res.status).toBe(404);
      expect(res.body.error?.code).toBe('NOT_FOUND');
    });
  });
});
