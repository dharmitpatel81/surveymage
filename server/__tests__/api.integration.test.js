const request = require('supertest');

jest.mock('../utils/logger', () => ({
  request: () => {},
  info: () => {},
  warn: () => {},
  error: () => {}
}));

const app = require('../app');

describe('API integration', () => {
  describe('GET /', () => {
    it('returns API info', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('SurveyMage API');
      expect(res.body.status).toBe('running');
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
