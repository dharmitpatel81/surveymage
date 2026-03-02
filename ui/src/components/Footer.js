import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="footer-full-width mt-auto border-t border-teal-700/40"
      style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6)' }}
    >
      <div className="w-full px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-md flex items-center justify-center shrink-0">
              <span className="text-teal-600 font-bold text-xs sm:text-sm">S</span>
            </div>
            <span className="text-white font-semibold text-base sm:text-lg tracking-tight">SurveyMage</span>
          </div>

          <nav className="flex items-center gap-4 sm:gap-6 md:gap-8 text-teal-100 text-xs sm:text-sm">
            <Link to="/" className="hover:text-white transition-colors">
              My Surveys
            </Link>
            <button type="button" className="bg-transparent border-0 p-0 text-inherit cursor-pointer hover:text-white transition-colors">
              Privacy
            </button>
            <button type="button" className="bg-transparent border-0 p-0 text-inherit cursor-pointer hover:text-white transition-colors">
              Terms
            </button>
          </nav>
        </div>

        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-teal-600/50 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-teal-50 text-xs sm:text-sm text-center sm:text-left">
            © {currentYear} SurveyMage. All rights reserved.
          </p>
          <p className="text-teal-100 text-xs">
            Create surveys that matter.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
