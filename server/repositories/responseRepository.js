const SurveyResponse = require('../models/SurveyResponse');

/**
 * Response repository - data access for survey responses
 */
async function existsBySurveyAndUser(surveyId, submittedBy) {
  const doc = await SurveyResponse.exists({ surveyId, submittedBy });
  return !!doc;
}

async function findBySurvey(surveyId) {
  return SurveyResponse.find({ surveyId })
    .sort({ submittedAt: -1 })
    .select('answers submittedAt')
    .lean();
}

async function create(data) {
  const doc = new SurveyResponse(data);
  await doc.save();
  return doc;
}

module.exports = {
  existsBySurveyAndUser,
  findBySurvey,
  create
};
