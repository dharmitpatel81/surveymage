import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-slate-300">404</h1>
        <p className="text-slate-600 font-medium mt-2">Page not found</p>
        <p className="text-slate-500 text-sm mt-1">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-block mt-6 px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
        >
          Go to My Surveys
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
