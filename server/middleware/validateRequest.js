const apiRes = require('../utils/apiResponse');
const {
  OBJECT_ID,
  surveyUpdateSchema,
  submitResponseSchema,
  checkSubmissionQuerySchema
} = require('../schemas/survey');

function zodError(res, code, result) {
  const msg = result.error.errors[0]?.message ?? 'Invalid request';
  return apiRes.error(res, code, msg, 400);
}

function validateSurveyId(req, res, next) {
  const result = OBJECT_ID.safeParse(req.params.id);
  if (!result.success) return apiRes.error(res, 'BAD_REQUEST', 'Invalid survey ID', 400);
  next();
}

function validateCheckSubmission(req, res, next) {
  const result = checkSubmissionQuerySchema.safeParse({
    surveyId: req.query.surveyId,
    submittedBy: req.query.submittedBy?.trim?.()
  });
  if (!result.success) return zodError(res, 'BAD_REQUEST', result);
  next();
}

function validateSubmitResponse(req, res, next) {
  const result = submitResponseSchema.safeParse({
    ...req.body,
    submittedBy: req.body.submittedBy?.trim?.()
  });
  if (!result.success) return zodError(res, 'VALIDATION', result);
  next();
}

function validateSurveyUpdate(req, res, next) {
  const result = surveyUpdateSchema.safeParse(req.body);
  if (!result.success) return zodError(res, 'VALIDATION', result);
  next();
}

module.exports = {
  validateSurveyId,
  validateCheckSubmission,
  validateSubmitResponse,
  validateSurveyUpdate
};
