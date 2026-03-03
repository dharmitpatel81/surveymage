const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['multiple-choice', 'checkbox', 'short-text', 'long-text', 'numeric']
  },
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: [String],
  required: { type: Boolean, default: false }
}, { _id: false });

const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  questions: [questionSchema],
  createdBy: {
    type: String,
    required: true,
    index: true
  },
  createdByEmail: {
    type: String
  },
  responseCount: {
    type: Number,
    default: 0
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  dashboardConfig: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
surveySchema.index({ createdBy: 1, createdAt: -1 });

const Survey = mongoose.model('Survey', surveySchema);

module.exports = Survey;