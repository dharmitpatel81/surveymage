const express = require('express');
const router = express.Router();
const responseService = require('../services/responseService');
const { validateCheckSubmission, validateSubmitResponse } = require('../middleware/validateRequest');
const apiRes = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * GET /checkSubmission?surveyId=xxx&submittedBy=xxx
 * Public: check if user has already submitted
 */
router.get('/checkSubmission', validateCheckSubmission, async (req, res) => {
  try {
    const { surveyId, submittedBy } = req.query;
    const result = await responseService.checkSubmission(surveyId, submittedBy.trim());
    return apiRes.success(res, { submitted: result.submitted });
  } catch (error) {
    logger.error('Check submission failed', { error: error.message });
    return apiRes.error(res, 'SERVER_ERROR', 'Failed to check submission', 500);
  }
});

/**
 * POST /submitResponse
 * Public: submit survey responses (no auth)
 */
router.post('/submitResponse', validateSubmitResponse, async (req, res) => {
  try {
    const { surveyId, answers, submittedBy } = req.body;
    const result = await responseService.submitResponse(surveyId, answers, submittedBy.trim());
    if (result.error === 'NOT_FOUND') {
      return apiRes.error(res, 'NOT_FOUND', 'Survey not found', 404);
    }
    if (result.error === 'CLOSED') {
      return apiRes.error(res, 'FORBIDDEN', 'This survey is closed and no longer accepting responses', 403);
    }
    if (result.error === 'VALIDATION') {
      return apiRes.error(res, 'VALIDATION', result.message, 400);
    }
    if (result.already) {
      return apiRes.success(res, { submitted: true }, 'Already submitted');
    }
    return apiRes.success(res, { responseId: result.responseId }, 'Response submitted', 201);
  } catch (error) {
    logger.error('Submit response failed', { error: error.message });
    return apiRes.error(res, 'SERVER_ERROR', 'Failed to submit response', 500);
  }
});

module.exports = router;
