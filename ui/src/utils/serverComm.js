import { auth } from '../firebase/config';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

async function apiFetch(endpoint, options = {}, authenticated = false) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (authenticated) {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    headers['Authorization'] = `Bearer ${await user.getIdToken()}`;
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message ?? data?.message ?? 'Request failed');
  return data;
}

const authenticatedFetch = (endpoint, options) => apiFetch(endpoint, options, true);
const publicFetch = (endpoint, options) => apiFetch(endpoint, options, false);

/**
 * Create a new blank survey
 * @returns {Promise<{ surveyId: string }>} Response with survey ID
 */
export const createSurvey = async () => {
  const res = await authenticatedFetch('/surveys/create', { method: 'POST' });
  const surveyId = res?.data?.surveyId ?? res?.surveyId;
  if (!surveyId || String(surveyId) === 'undefined') {
    throw new Error('Create survey failed: no ID returned');
  }
  return { surveyId: String(surveyId) };
};

/**
 * Update an existing survey
 * @param {string} surveyId - Survey ID
 * @param {object} surveyData - Survey data containing title, description, and questions
 * @returns {Promise<object>} Response with updated survey details
 */
export const updateSurvey = (surveyId, surveyData) => {
  if (!surveyId || String(surveyId) === 'undefined') {
    throw new Error('Invalid survey ID');
  }
  return authenticatedFetch(`/surveys/${surveyId}`, {
    method: 'PUT',
    body: JSON.stringify(surveyData),
  });
};

/**
 * Get all surveys for the current user
 */
export const getSurveys = () =>
  authenticatedFetch('/surveys', { method: 'GET' });

/**
 * Get a specific survey by ID
 */
export const getSurveyById = (surveyId) =>
  authenticatedFetch(`/surveys/${surveyId}`, { method: 'GET' });

/**
 * Get survey responses for analytics
 */
export const getSurveyResponses = (surveyId) =>
  authenticatedFetch(`/surveys/${surveyId}/responses`, { method: 'GET' });

/**
 * Delete a survey
 */
export const deleteSurvey = (surveyId) =>
  authenticatedFetch(`/surveys/${surveyId}`, { method: 'DELETE' });

/**
 * Public: get a survey for taking (no auth)
 */
export const getPublicSurveyById = (surveyId) =>
  publicFetch(`/surveys/public/${surveyId}`, { method: 'GET' });

/**
 * Public: check if user has already submitted this survey.
 * @returns {Promise<{ submitted: boolean }>}
 */
export const checkSubmission = async (surveyId, submittedBy) => {
  const res = await publicFetch(`/responses/checkSubmission?surveyId=${encodeURIComponent(surveyId)}&submittedBy=${encodeURIComponent(submittedBy)}`, {
    method: 'GET',
  });
  return { submitted: res.data?.submitted ?? res.submitted ?? false };
};

/**
 * Public: submit survey responses (no auth). Stores in response collection.
 * submittedBy is required for one-response-per-user enforcement.
 */
export const submitSurveyResponse = (surveyId, answers, submittedBy) =>
  publicFetch('/responses/submitResponse', {
    method: 'POST',
    body: JSON.stringify({ surveyId, answers, submittedBy }),
  });