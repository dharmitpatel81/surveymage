const express = require('express');
const router = express.Router();
const surveyService = require('../services/surveyService');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');
const { validateSurveyId, validateSurveyUpdate } = require('../middleware/validateRequest');
const { publicLimiter } = require('../middleware/rateLimit');
const apiRes = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * POST /surveys/create - Create blank survey
 */
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
 * PUT /surveys/:id - Update survey
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
 * GET /surveys - List user's surveys
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
 * GET /surveys/:id/responses - Get survey + responses for analytics
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
 * GET /surveys/public/:id - Public survey (no auth, rate limited)
 */
router.get('/public/:id', publicLimiter, validateSurveyId, async (req, res) => {
  try {
    const survey = await surveyService.getPublicById(req.params.id);
    if (!survey) {
      return apiRes.error(res, 'NOT_FOUND', 'Survey not found', 404);
    }
    apiRes.success(res, survey);
  } catch (error) {
    logger.error('Get public survey failed', { error: error.message });
    apiRes.error(res, 'SERVER_ERROR', 'Failed to fetch survey', 500);
  }
});

/**
 * GET /surveys/:id - Get survey by ID (auth required)
 */
router.get('/:id', verifyFirebaseToken, validateSurveyId, async (req, res) => {
  try {
    const survey = await surveyService.getById(req.params.id, req.user.uid);
    if (!survey) {
      return apiRes.error(res, 'NOT_FOUND', 'Survey not found', 404);
    }
    apiRes.success(res, survey);
  } catch (error) {
    logger.error('Get survey failed', { error: error.message });
    apiRes.error(res, 'SERVER_ERROR', 'Failed to fetch survey', 500);
  }
});

/**
 * DELETE /surveys/:id - Delete survey
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
