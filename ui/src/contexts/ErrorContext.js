import React, { createContext, useContext, useCallback, useState } from 'react';

const ErrorContext = createContext(null);

export function useError() {
  const ctx = useContext(ErrorContext);
  return ctx || { reportError: () => {} };
}

export function ErrorProvider({ children }) {
  const [toast, setToast] = useState(null);

  const reportError = useCallback((message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Error]', message, meta);
    }
    const userMessage = typeof message === 'string' ? message : 'Something went wrong. Please try again.';
    const id = Date.now();
    setToast({ message: userMessage, id });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 5000);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <ErrorContext.Provider value={{ reportError }}>
      {children}
      {toast && (
        <div
          role="alert"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in"
        >
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button
            onClick={dismissToast}
            className="text-red-600 hover:text-red-800 p-1 rounded"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
    </ErrorContext.Provider>
  );
}
