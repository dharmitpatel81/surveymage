const { isValidId } = require('../utils/validation');
const apiRes = require('../utils/apiResponse');

/**
 * Validation middleware - validates request params/body
 */
function validateSurveyId(req, res, next) {
  if (!isValidId(req.params.id)) {
    return apiRes.error(res, 'BAD_REQUEST', 'Invalid survey ID', 400);
  }
  next();
}

function validateCheckSubmission(req, res, next) {
  const { surveyId, submittedBy } = req.query;
  if (!isValidId(surveyId)) {
    return apiRes.error(res, 'BAD_REQUEST', 'Invalid survey ID', 400);
  }
  if (!submittedBy || typeof submittedBy !== 'string' || !submittedBy.trim()) {
    return apiRes.error(res, 'BAD_REQUEST', 'submittedBy is required', 400);
  }
  next();
}

function validateSubmitResponse(req, res, next) {
  const { surveyId, answers, submittedBy } = req.body;
  if (!isValidId(surveyId)) {
    return apiRes.error(res, 'VALIDATION', 'Invalid survey ID', 400);
  }
  if (!Array.isArray(answers)) {
    return apiRes.error(res, 'VALIDATION', 'answers must be an array', 400);
  }
  if (!submittedBy || typeof submittedBy !== 'string' || !submittedBy.trim()) {
    return apiRes.error(res, 'VALIDATION', 'submittedBy is required', 400);
  }
  next();
}

function validateSurveyUpdate(req, res, next) {
  const { title, questions } = req.body;
  if (title !== undefined && title !== null && !String(title).trim()) {
    return apiRes.error(res, 'VALIDATION', 'Survey title cannot be empty', 400);
  }
  if (questions !== undefined) {
    if (!Array.isArray(questions) || questions.length === 0) {
      return apiRes.error(res, 'VALIDATION', 'At least one question is required', 400);
    }
    const validTypes = ['multiple-choice', 'checkbox', 'short-text', 'long-text', 'numeric'];
    for (const q of questions) {
      if (!q.id || String(q.id).trim() === '') {
        return apiRes.error(res, 'VALIDATION', 'All questions must have an id', 400);
      }
      if (!q.questionText || !String(q.questionText).trim()) {
        return apiRes.error(res, 'VALIDATION', 'All questions must have text', 400);
      }
      if (!validTypes.includes(q.type)) {
        return apiRes.error(res, 'VALIDATION', 'Invalid question type', 400);
      }
      if ((q.type === 'multiple-choice' || q.type === 'checkbox') && (!q.options || q.options.length === 0)) {
        return apiRes.error(res, 'VALIDATION', 'Question must have options', 400);
      }
    }
  }
  next();
}

module.exports = {
  validateSurveyId,
  validateCheckSubmission,
  validateSubmitResponse,
  validateSurveyUpdate
};
