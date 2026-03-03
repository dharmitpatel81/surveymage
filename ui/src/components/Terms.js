import React from 'react';
import { Link } from 'react-router-dom';

function Terms() {
  return (
    <div className="flex-1 px-4 py-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">Terms of Service</h1>
      <p className="text-slate-600 mt-4 text-sm">
        By using SurveyMage, you agree to use the service responsibly. Do not collect
        sensitive personal data without proper consent. Survey creators are responsible
        for their survey content.
      </p>
      <Link to="/" className="inline-block mt-6 text-teal-600 hover:text-teal-700 font-medium text-sm">
        ← Back to My Surveys
      </Link>
    </div>
  );
}

export default Terms;
