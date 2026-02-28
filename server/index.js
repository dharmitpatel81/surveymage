const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const surveyRoutes = require('./routes/surveyRoutes');
const Survey = require('./models/Survey');
const SurveyResponse = require('./models/SurveyResponse');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com' 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'SurveyMage API', 
    version: '1.0.0',
    status: 'running' 
  });
});

app.use('/api/surveys', surveyRoutes);

const isValidId = (id) => id && id !== 'undefined' && mongoose.Types.ObjectId.isValid(id);

/**
 * GET /api/checkSubmission?surveyId=xxx&submittedBy=xxx
 * Public: check if this user has already submitted a response for this survey.
 */
app.get('/api/checkSubmission', async (req, res) => {
  try {
    const { surveyId, submittedBy } = req.query;
    if (!isValidId(surveyId)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid survey ID' });
    }
    if (!submittedBy || typeof submittedBy !== 'string' || !submittedBy.trim()) {
      return res.status(400).json({ error: 'Bad Request', message: 'submittedBy is required' });
    }

    const exists = await SurveyResponse.exists({ surveyId, submittedBy: submittedBy.trim() });
    return res.json({
      success: true,
      submitted: !!exists
    });
  } catch (error) {
    console.error('Error checking submission:', error);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to check submission' });
  }
});

/**
 * POST /api/submitResponse
 * Public: submit survey responses (no auth). Stores in response collection.
 * Requires submittedBy to enforce one response per user.
 */
app.post('/api/submitResponse', async (req, res) => {
  try {
    const { surveyId, answers, submittedBy } = req.body;
    if (!isValidId(surveyId)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid survey ID' });
    }
    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'Validation Error', message: 'answers must be an array' });
    }
    if (!submittedBy || typeof submittedBy !== 'string' || !submittedBy.trim()) {
      return res.status(400).json({ error: 'Validation Error', message: 'submittedBy is required' });
    }

    const by = submittedBy.trim();

    const alreadySubmitted = await SurveyResponse.exists({ surveyId, submittedBy: by });
    if (alreadySubmitted) {
      return res.json({
        success: true,
        message: 'Already submitted',
        submitted: true
      });
    }

    const responseDoc = new SurveyResponse({
      surveyId,
      submittedBy: by,
      answers: answers.map((a) => ({
        questionId: a?.questionId != null ? String(a.questionId) : '',
        value: a?.value
      }))
    });

    for (const a of responseDoc.answers) {
      if (!a.questionId) {
        return res.status(400).json({ error: 'Validation Error', message: 'Each answer must include questionId' });
      }
    }

    await responseDoc.save();
    await Survey.updateOne({ _id: surveyId }, { $inc: { responseCount: 1 } });

    return res.status(201).json({
      success: true,
      message: 'Response submitted',
      data: { responseId: responseDoc._id.toString() }
    });
  } catch (error) {
    console.error('Error submitting response:', error);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to submit response' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    message: 'Route not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Server Error', 
    message: err.message || 'Something went wrong' 
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB');
  
  // Start server only after DB connection
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});