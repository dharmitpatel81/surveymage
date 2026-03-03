import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SurveyList from './SurveyList';

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: null, isAnonymous: false })
}));
jest.mock('../contexts/ErrorContext', () => ({
  useError: () => ({ reportError: jest.fn() })
}));
jest.mock('../utils/serverComm', () => ({
  getSurveys: jest.fn(),
  deleteSurvey: jest.fn(),
  getSurveyById: jest.fn(),
  createSurvey: jest.fn(),
  updateSurvey: jest.fn()
}));

function renderSurveyList() {
  return render(
    <BrowserRouter>
      <SurveyList />
    </BrowserRouter>
  );
}

test('renders My Surveys heading when not logged in', async () => {
  renderSurveyList();
  expect(await screen.findByText(/My Surveys/i)).toBeInTheDocument();
});
