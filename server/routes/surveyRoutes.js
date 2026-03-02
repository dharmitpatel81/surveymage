const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');
const SurveyResponse = require('../models/SurveyResponse');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');
const { isValidId } = require('../utils/validation');

/**
 * POST /api/surveys/create
 * Create a new blank survey and return its ID
 * Protected route - requires authentication
 */
router.post('/create', verifyFirebaseToken, async (req, res) => {
  try {
    // Create a blank survey
    const survey = new Survey({
      title: 'Untitled Survey',
      description: '',
      questions: [],
      createdBy: req.user.uid,
      createdByEmail: req.user.email || null
    });

    await survey.save();

    res.status(201).json({
      success: true,
      message: 'Survey created successfully',
      data: {
        surveyId: survey._id.toString(),
        title: survey.title,
        createdAt: survey.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating survey:', error);
    res.status(500).json({ 
      error: 'Server Error', 
      message: 'Failed to create survey' 
    });
  }
});

/**
 * PUT /api/surveys/:id
 * Update an existing survey
 * Protected route - requires authentication
 */
router.put('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid survey ID' });
    }
    const { title, description, questions } = req.body;

    // Find survey and verify ownership
    const survey = await Survey.findOne({
      _id: req.params.id,
      createdBy: req.user.uid
    });

    if (!survey) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'Survey not found or you do not have permission to edit it' 
      });
    }

    // Validation
    if (title && !title.trim()) {
      return res.status(400).json({ 
        error: 'Validation Error', 
        message: 'Survey title cannot be empty' 
      });
    }

    if (questions && (!Array.isArray(questions) || questions.length === 0)) {
      return res.status(400).json({ 
        error: 'Validation Error', 
        message: 'At least one question is required' 
      });
    }

    // Validate each question if provided
    if (questions) {
      for (const question of questions) {
        if (!question.id || String(question.id).trim() === '') {
          return res.status(400).json({
            error: 'Validation Error',
            message: 'All questions must have an id'
          });
        }

        if (!question.questionText || !question.questionText.trim()) {
          return res.status(400).json({ 
            error: 'Validation Error', 
            message: 'All questions must have text' 
          });
        }

        if (!['multiple-choice', 'checkbox', 'short-text', 'long-text', 'numeric'].includes(question.type)) {
          return res.status(400).json({ 
            error: 'Validation Error', 
            message: 'Invalid question type' 
          });
        }

        if ((question.type === 'multiple-choice' || question.type === 'checkbox') && 
            (!question.options || question.options.length === 0)) {
          return res.status(400).json({ 
            error: 'Validation Error', 
            message: `Question "${question.questionText}" must have options` 
          });
        }
      }
    }

    // Update survey
    if (title) survey.title = title.trim();
    if (description !== undefined) survey.description = description.trim();
    if (questions) survey.questions = questions;

    await survey.save();

    res.json({
      success: true,
      message: 'Survey updated successfully',
      data: {
        surveyId: survey._id.toString(),
        title: survey.title,
        questionCount: survey.questions.length,
        updatedAt: survey.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating survey:', error);
    const message = error.name === 'ValidationError' 
      ? (error.message || 'Validation failed')
      : (error.message || 'Failed to update survey');
    res.status(500).json({ 
      error: 'Server Error', 
      message 
    });
  }
});

/**
 * GET /api/surveys
 * Get all surveys for the authenticated user.
 * Includes question count (from questions array) and response count (from response collection).
 */
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const surveys = await Survey.find({ createdBy: req.user.uid })
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();

    const surveyIds = surveys.map((s) => s._id);
    const responseCounts = await SurveyResponse.aggregate([
      { $match: { surveyId: { $in: surveyIds } } },
      { $group: { _id: '$surveyId', count: { $sum: 1 } } }
    ]);
    const countMap = new Map(responseCounts.map((r) => [r._id.toString(), r.count]));

    const data = surveys.map((s) => ({
      ...s,
      questionCount: (s.questions || []).length,
      responseCount: countMap.get(s._id.toString()) ?? s.responseCount ?? 0
    }));

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch surveys'
    });
  }
});

/**
 * GET /api/surveys/public/:id
 * Public survey fetch for survey taker experience
 * Returns only what is needed to take a survey.
 */
router.get('/public/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid survey ID' });
    }

    const survey = await Survey.findById(req.params.id)
      .select('title description questions')
      .lean();

    if (!survey) {
      return res.status(404).json({ error: 'Not Found', message: 'Survey not found' });
    }

    return res.json({ success: true, data: survey });
  } catch (error) {
    console.error('Error fetching public survey:', error);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to fetch survey' });
  }
});

/**
 * GET /api/surveys/:id
 * Get a specific survey by ID
 */
router.get('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid survey ID' });
    }
    const survey = await Survey.findOne({
      _id: req.params.id,
      createdBy: req.user.uid
    })
      .lean();

    if (!survey) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'Survey not found' 
      });
    }

    res.json({
      success: true,
      data: survey
    });

  } catch (error) {
    console.error('Error fetching survey:', error);
    res.status(500).json({ 
      error: 'Server Error', 
      message: 'Failed to fetch survey' 
    });
  }
});

/**
 * DELETE /api/surveys/:id
 * Delete a survey
 */
router.delete('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid survey ID' });
    }
    const survey = await Survey.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.uid
    });

    if (!survey) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'Survey not found' 
      });
    }

    res.json({
      success: true,
      message: 'Survey deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting survey:', error);
    res.status(500).json({ 
      error: 'Server Error', 
      message: 'Failed to delete survey' 
    });
  }
});

module.exports = router;