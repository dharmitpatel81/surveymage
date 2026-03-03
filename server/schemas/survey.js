const { z } = require('zod');

const OBJECT_ID = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid survey ID');

const questionTypes = ['multiple-choice', 'checkbox', 'short-text', 'long-text', 'numeric'];

const questionSchema = z.object({
  id: z.string().min(1, 'Question must have an id'),
  type: z.enum(questionTypes, { errorMap: () => ({ message: 'Invalid question type' }) }),
  questionText: z.string().min(1, 'Question must have text'),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional()
}).refine(
  (q) => !['multiple-choice', 'checkbox'].includes(q.type) || (q.options && q.options.length > 0),
  { message: 'Question must have options', path: ['options'] }
);

const surveyUpdateSchema = z.object({
  title: z.union([z.string().trim().min(1), z.null()]).optional(),
  description: z.union([z.string().trim(), z.null()]).optional(),
  questions: z.array(questionSchema).min(1, 'At least one question is required').optional(),
  isOpen: z.boolean().optional(),
  dashboardConfig: z.any().optional()
});

const answerSchema = z.object({
  questionId: z.string().min(1),
  value: z.any()
});

const submitResponseSchema = z.object({
  surveyId: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid survey ID'),
  answers: z.array(answerSchema),
  submittedBy: z.string().min(1, 'submittedBy is required').trim()
});

const checkSubmissionQuerySchema = z.object({
  surveyId: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid survey ID'),
  submittedBy: z.string().min(1, 'submittedBy is required').trim()
});

module.exports = {
  OBJECT_ID,
  surveyUpdateSchema,
  submitResponseSchema,
  checkSubmissionQuerySchema
};
