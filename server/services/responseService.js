const surveyRepo = require('../repositories/surveyRepository');
const responseRepo = require('../repositories/responseRepository');
const logger = require('../utils/logger');

/**
 * Response service - business logic for survey responses
 */
async function checkSubmission(surveyId, submittedBy) {
  const exists = await responseRepo.existsBySurveyAndUser(surveyId, submittedBy);
  return { submitted: !!exists };
}

async function submitResponse(surveyId, answers, submittedBy) {
  const by = submittedBy;
  const survey = await surveyRepo.findPublicById(surveyId);
  if (!survey) return { error: 'NOT_FOUND' };
  if (survey.isOpen === false) return { error: 'CLOSED' };
  const alreadySubmitted = await responseRepo.existsBySurveyAndUser(surveyId, by);
  if (alreadySubmitted) return { submitted: true, already: true };
  const validAnswers = answers
    .filter((a) => a?.questionId != null && String(a.questionId).trim())
    .map((a) => ({ questionId: String(a.questionId), value: a?.value }));
  if (validAnswers.length !== answers.length) {
    return { error: 'VALIDATION', message: 'Each answer must include questionId' };
  }
  const doc = await responseRepo.create({
    surveyId,
    submittedBy: by,
    answers: validAnswers
  });
  await surveyRepo.incrementResponseCount(surveyId);
  logger.info('Response submitted', { surveyId, responseId: doc._id.toString() });
  return { responseId: doc._id.toString() };
}

module.exports = {
  checkSubmission,
  submitResponse
};
