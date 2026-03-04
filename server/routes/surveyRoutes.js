const express = require('express');
const router = express.Router();

/**
 * @openapi
 * /surveys/create:
 *   post:
 *     summary: Create blank survey
 *     tags: [Surveys]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Survey created }
 *       401: { description: Unauthorized }
 */
const surveyService = require('../services/surveyService');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');
const { validateSurveyId, validateSurveyUpdate } = require('../middleware/validateRequest');
const { publicLimiter } = require('../middleware/rateLimit');
const apiRes = require('../utils/apiResponse');
const logger = require('../utils/logger');

router.post('/create', verifyFirebaseToken, async (req, res) => {
  try {
    const survey = await surveyService.createSurvey(req.user.uid, req.user.email);
    apiRes.success(res, {
      surveyId: survey._id.toString(),
      title: survey.title,
      createdAt: survey.createdAt
    }, 'Survey created successfully', 201);
  } catch (error) {
    logger.error('Create survey failed', { error: error.message });
    apiRes.error(res, 'SERVER_ERROR', 'Failed to create survey', 500);
  }
});

/**
 * @openapi
 * /surveys/{id}:
 *   put:
 *     summary: Update survey
 *     tags: [Surveys]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     requestBody: { content: { application/json: { schema: { type: object } } } }
 *     responses:
 *       200: { description: Updated }
 *       404: { description: Not found }
 */
router.put('/:id', verifyFirebaseToken, validateSurveyId, validateSurveyUpdate, async (req, res) => {
  try {
    const { title, description, questions, isOpen, dashboardConfig } = req.body;
    const survey = await surveyService.updateSurvey(req.params.id, req.user.uid, {
      ...(title && { title: title.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(questions && { questions }),
      ...(typeof isOpen === 'boolean' && { isOpen }),
      ...(dashboardConfig !== undefined && { dashboardConfig })
    });
    if (!survey) {
      return apiRes.error(res, 'NOT_FOUND', 'Survey not found or you do not have permission to edit it', 404);
    }
    apiRes.success(res, {
      surveyId: survey._id.toString(),
      title: survey.title,
      questionCount: survey.questions.length,
      updatedAt: survey.updatedAt
    }, 'Survey updated successfully');
  } catch (error) {
    logger.error('Update survey failed', { error: error.message });
    const message = error.name === 'ValidationError' ? error.message : 'Failed to update survey';
    apiRes.error(res, 'SERVER_ERROR', message, 500);
  }
});

/**
 * @openapi
 * /surveys:
 *   get:
 *     summary: List user's surveys
 *     tags: [Surveys]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of surveys }
 *       401: { description: Unauthorized - click Authorize and add Firebase ID token }
 */
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const data = await surveyService.listByUser(req.user.uid);
    apiRes.success(res, data);
  } catch (error) {
    logger.error('List surveys failed', { error: error.message });
    apiRes.error(res, 'SERVER_ERROR', 'Failed to fetch surveys', 500);
  }
});

/**
 * @openapi
 * /surveys/{id}/responses:
 *   get:
 *     summary: Get survey and responses for analytics
 *     tags: [Surveys]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Survey and responses }
 *       404: { description: Not found }
 */
router.get('/:id/responses', verifyFirebaseToken, validateSurveyId, async (req, res) => {
  try {
    const data = await surveyService.getResponsesForAnalytics(req.params.id, req.user.uid);
    if (!data) {
      return apiRes.error(res, 'NOT_FOUND', 'Survey not found', 404);
    }
    apiRes.success(res, data);
  } catch (error) {
    logger.error('Get responses failed', { error: error.message });
    apiRes.error(res, 'SERVER_ERROR', 'Failed to fetch responses', 500);
  }
});

/**
 * @openapi
 * /surveys/public/{id}:
 *   get:
 *     summary: Get public survey (no auth)
 *     tags: [Surveys]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Survey ID (24 hex chars). Get from MongoDB surveys collection or survey URL /s/{id}
 *         example: "69a66153ad74b4d1c90dd7a1"
 *     responses:
 *       200: { description: "Survey with title, description, questions, isOpen" }
 *       400: { description: Invalid ID format }
 *       404: { description: Survey not found }
 */
router.get('/public/:id', publicLimiter, validateSurveyId, async (req, res) => {
  try {
    const survey = await surveyService.getPublicById(req.params.id);
    if (!survey) {
      return apiRes.error(res, 'NOT_FOUND', 'Survey not found. Check that the ID exists in the database (24 hex chars, e.g. 69a66153ad74b4d1c90dd7a1)', 404);
    }
    apiRes.success(res, survey);
  } catch (error) {
    logger.error('Get public survey failed', { error: error.message });
    apiRes.error(res, 'SERVER_ERROR', 'Failed to fetch survey', 500);
  }
});

router.get('/:id', verifyFirebaseToken, validateSurveyId, async (req, res) => {
  try {
    const survey = await surveyService.getById(req.params.id, req.user.uid);
    if (!survey) {
      return apiRes.error(res, 'NOT_FOUND', 'Survey not found or you do not have permission to access it', 404);
    }
    apiRes.success(res, survey);
  } catch (error) {
    logger.error('Get survey failed', { error: error.message });
    apiRes.error(res, 'SERVER_ERROR', 'Failed to fetch survey', 500);
  }
});

/**
 * @openapi
 * /surveys/{id}:
 *   get:
 *     summary: Get survey by ID (auth)
 *     tags: [Surveys]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: MongoDB ObjectId (24 hex chars). Use GET /surveys first to get IDs you own.
 *     responses:
 *       200: { description: Survey }
 *       404: { description: Survey not found or not owned by you }
 *   delete:
 *     summary: Delete survey
 *     tags: [Surveys]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Deleted }
 *       404: { description: Not found }
 */
router.delete('/:id', verifyFirebaseToken, validateSurveyId, async (req, res) => {
  try {
    const deleted = await surveyService.deleteSurvey(req.params.id, req.user.uid);
    if (!deleted) {
      return apiRes.error(res, 'NOT_FOUND', 'Survey not found', 404);
    }
    apiRes.success(res, null, 'Survey deleted successfully');
  } catch (error) {
    logger.error('Delete survey failed', { error: error.message });
    apiRes.error(res, 'SERVER_ERROR', 'Failed to delete survey', 500);
  }
});

module.exports = router;
