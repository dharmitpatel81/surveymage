const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed }
  },
  { _id: false }
);

const surveyResponseSchema = new mongoose.Schema(
  {
    surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true, index: true },
    submittedBy: { type: String, required: true, index: true },
    answers: { type: [answerSchema], default: [] },
    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

surveyResponseSchema.index({ surveyId: 1, createdAt: -1 });
surveyResponseSchema.index({ surveyId: 1, submittedBy: 1 }, { unique: true, sparse: true });

const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);

module.exports = SurveyResponse;

