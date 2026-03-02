const Survey = require('./models/Survey');
const SurveyResponse = require('./models/SurveyResponse');

/**
 * Get survey and all responses for analytics.
 * Verifies the user owns the survey before returning data.
 * @param {string} surveyId - MongoDB ObjectId of the survey
 * @param {string} userId - Firebase uid of the owner
 * @returns {Promise<{ survey: object, responses: array }|null>} Survey + responses, or null if not found/unauthorized
 */
async function getSurveyResponsesForAnalytics(surveyId, userId) {
  const survey = await Survey.findOne({
    _id: surveyId,
    createdBy: userId
  }).lean();

  if (!survey) return null;

  const responses = await SurveyResponse.find({ surveyId })
    .sort({ submittedAt: -1 })
    .select('answers submittedAt')
    .lean();

  return {
    survey: {
      title: survey.title,
      questions: survey.questions || []
    },
    responses: responses.map((r) => ({
      answers: r.answers,
      submittedAt: r.submittedAt
    }))
  };
}

module.exports = {
  getSurveyResponsesForAnalytics
};
