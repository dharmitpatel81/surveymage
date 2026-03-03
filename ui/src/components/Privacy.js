import React from 'react';
import { Link } from 'react-router-dom';

function Privacy() {
  return (
    <div className="flex-1 px-4 py-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="text-slate-600 mt-4 text-sm">
        SurveyMage respects your privacy. Survey data and responses are stored securely.
        We use Firebase for authentication. For questions, contact your administrator.
      </p>
      <Link to="/" className="inline-block mt-6 text-teal-600 hover:text-teal-700 font-medium text-sm">
        ← Back to My Surveys
      </Link>
    </div>
  );
}

export default Privacy;
