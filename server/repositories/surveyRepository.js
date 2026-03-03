const Survey = require('../models/Survey');
const SurveyResponse = require('../models/SurveyResponse');

/**
 * Survey repository - data access for surveys
 */
async function findByUser(userId) {
  const surveys = await Survey.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .select('-__v')
    .lean();
  return surveys;
}

async function findById(id, userId = null) {
  const query = { _id: id };
  if (userId) query.createdBy = userId;
  return Survey.findOne(query).lean();
}

async function findPublicById(id) {
  return Survey.findById(id)
    .select('title description questions isOpen')
    .lean();
}

async function findByIdForAnalytics(id, userId) {
  const survey = await Survey.findOne({
    _id: id,
    createdBy: userId
  }).lean();
  return survey;
}

async function create(data) {
  const survey = new Survey(data);
  await survey.save();
  return survey;
}

async function update(id, userId, updates) {
  const survey = await Survey.findOne({ _id: id, createdBy: userId });
  if (!survey) return null;
  Object.assign(survey, updates);
  await survey.save();
  return survey;
}

async function deleteById(id, userId) {
  const result = await Survey.findOneAndDelete({ _id: id, createdBy: userId });
  return !!result;
}

async function incrementResponseCount(id) {
  await Survey.updateOne({ _id: id }, { $inc: { responseCount: 1 } });
}

async function getResponseCounts(surveyIds) {
  const counts = await SurveyResponse.aggregate([
    { $match: { surveyId: { $in: surveyIds } } },
    { $group: { _id: '$surveyId', count: { $sum: 1 } } }
  ]);
  return new Map(counts.map((r) => [r._id.toString(), r.count]));
}

module.exports = {
  findByUser,
  findById,
  findPublicById,
  findByIdForAnalytics,
  create,
  update,
  deleteById,
  incrementResponseCount,
  getResponseCounts
};
