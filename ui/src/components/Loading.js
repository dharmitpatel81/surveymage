import React from 'react';
import { Loader } from 'lucide-react';

/**
 * Shared loading spinner with optional message
 */
function Loading({ message = 'Loading...', className = '' }) {
  return (
    <div className={`flex items-center justify-center min-h-[50vh] px-4 ${className}`} aria-live="polite" aria-busy="true">
      <div className="text-center">
        <Loader className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-teal-600 mx-auto mb-4" aria-hidden />
        <p className="text-slate-600 font-medium text-sm sm:text-base">{message}</p>
      </div>
    </div>
  );
}

export default Loading;
