const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['multiple-choice', 'checkbox', 'short-text', 'long-text']
  },
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: [String]
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
  isPublished: {
    type: Boolean,
    default: false
  },
  responseCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
surveySchema.index({ createdBy: 1, createdAt: -1 });

const Survey = mongoose.model('Survey', surveySchema);

module.exports = Survey;