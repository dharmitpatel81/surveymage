import { render, screen } from '@testing-library/react';
import App from './App';

test('renders SurveyMage app', async () => {
  render(<App />);
  const heading = await screen.findByText(/SurveyMage|My Surveys/i, {}, { timeout: 5000 });
  expect(heading).toBeInTheDocument();
});
