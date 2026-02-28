import { auth } from '../firebase/config';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Get the current user's Firebase ID token
 */
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
};

/**
 * Make an authenticated API request
 */
const authenticatedFetch = async (endpoint, options = {}) => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Make a public (unauthenticated) API request
 */
const publicFetch = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

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
export const checkSubmission = (surveyId, submittedBy) =>
  publicFetch(`/checkSubmission?surveyId=${encodeURIComponent(surveyId)}&submittedBy=${encodeURIComponent(submittedBy)}`, {
    method: 'GET',
  });

/**
 * Public: submit survey responses (no auth). Stores in response collection.
 * submittedBy is required for one-response-per-user enforcement.
 */
export const submitSurveyResponse = (surveyId, answers, submittedBy) =>
  publicFetch('/submitResponse', {
    method: 'POST',
    body: JSON.stringify({ surveyId, answers, submittedBy }),
  });