import React, { createContext, useContext, useCallback } from 'react';

const ErrorContext = createContext(null);

export function useError() {
  const ctx = useContext(ErrorContext);
  return ctx || { reportError: () => {} };
}

export function ErrorProvider({ children }) {
  const reportError = useCallback((message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Error]', message, meta);
    }
  }, []);

  return (
    <ErrorContext.Provider value={{ reportError }}>
      {children}
    </ErrorContext.Provider>
  );
}
