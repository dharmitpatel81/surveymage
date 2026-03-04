const express = require('express');
const router = express.Router();

/**
 * @openapi
 * /responses/checkSubmission:
 *   get:
 *     summary: Check if user has already submitted (no auth)
 *     tags: [Responses]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: surveyId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: submittedBy
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: { submitted: boolean } }
 */
const responseService = require('../services/responseService');
const { validateCheckSubmission, validateSubmitResponse } = require('../middleware/validateRequest');
const apiRes = require('../utils/apiResponse');
const logger = require('../utils/logger');

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
 * @openapi
 * /responses/submitResponse:
 *   post:
 *     summary: Submit survey responses (no auth)
 *     tags: [Responses]
 *     security: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [surveyId, answers, submittedBy]
 *             properties:
 *               surveyId: { type: string }
 *               answers: { type: array }
 *               submittedBy: { type: string }
 *     responses:
 *       201: { description: Submitted }
 *       400: { description: Validation error }
 *       403: { description: Survey closed }
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
