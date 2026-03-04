import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({ currentUser: null, isAnonymous: false })
}));
jest.mock('./contexts/ErrorContext', () => ({
  ErrorProvider: ({ children }) => children,
  useError: () => ({ reportError: jest.fn() })
}));
jest.mock('./utils/serverComm', () => ({
  getSurveys: jest.fn().mockResolvedValue({ data: [] }),
  deleteSurvey: jest.fn(),
  getSurveyById: jest.fn(),
  createSurvey: jest.fn(),
  updateSurvey: jest.fn(),
  getSurveyResponses: jest.fn(),
  getPublicSurveyById: jest.fn(),
  checkSubmission: jest.fn(),
  submitSurveyResponse: jest.fn()
}));

test('renders SurveyMage app', async () => {
  render(<App />);
  const heading = await screen.findByText(/SurveyMage|My Surveys/i, {}, { timeout: 5000 });
  expect(heading).toBeInTheDocument();
});
