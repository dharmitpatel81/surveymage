const surveyRepo = require('../repositories/surveyRepository');
const responseRepo = require('../repositories/responseRepository');
const logger = require('../utils/logger');

/**
 * Survey service - business logic for surveys
 */
async function listByUser(userId) {
  const surveys = await surveyRepo.findByUser(userId);
  const surveyIds = surveys.map((s) => s._id);
  const countMap = await surveyRepo.getResponseCounts(surveyIds);
  return surveys.map((s) => ({
    ...s,
    questionCount: (s.questions || []).length,
    responseCount: countMap.get(s._id.toString()) ?? s.responseCount ?? 0
  }));
}

async function getById(id, userId) {
  const survey = await surveyRepo.findById(id, userId);
  if (!survey) {
    logger.warn('Survey not found', { surveyId: id, userId });
    return null;
  }
  return survey;
}

async function getPublicById(id) {
  const survey = await surveyRepo.findPublicById(id);
  if (!survey) {
    logger.warn('Public survey not found', { surveyId: id });
    return null;
  }
  return survey;
}

async function getResponsesForAnalytics(surveyId, userId) {
  const survey = await surveyRepo.findByIdForAnalytics(surveyId, userId);
  if (!survey) return null;
  const responses = await responseRepo.findBySurvey(surveyId);
  return {
    survey: {
      title: survey.title,
      questions: survey.questions || [],
      dashboardConfig: survey.dashboardConfig
    },
    responses: responses.map((r) => ({
      answers: r.answers,
      submittedAt: r.submittedAt
    }))
  };
}

async function createSurvey(userId, userEmail) {
  const survey = await surveyRepo.create({
    title: 'Untitled Survey',
    description: '',
    questions: [],
    createdBy: userId,
    createdByEmail: userEmail || null
  });
  logger.info('Survey created', { surveyId: survey._id.toString(), userId });
  return survey;
}

async function updateSurvey(id, userId, updates) {
  const survey = await surveyRepo.update(id, userId, updates);
  if (!survey) return null;
  return survey;
}

async function deleteSurvey(id, userId) {
  const deleted = await surveyRepo.deleteById(id, userId);
  if (deleted) logger.info('Survey deleted', { surveyId: id, userId });
  return deleted;
}

module.exports = {
  listByUser,
  getById,
  getPublicById,
  getResponsesForAnalytics,
  createSurvey,
  updateSurvey,
  deleteSurvey
};
