import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useError } from '../contexts/ErrorContext';
import { LogOut, User, Key } from 'lucide-react'; // eslint-disable-line no-unused-vars -- Key used in dev-mode only
import SignIn from './SignIn';
import { useNavigate } from 'react-router-dom';

function NavBar() {
  const navigate = useNavigate();
  const { currentUser, logout, isAnonymous } = useAuth();
  const { reportError } = useError();
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInMode, setSignInMode] = useState('login');
  const [tokenCopied, setTokenCopied] = useState(false); // eslint-disable-line no-unused-vars -- used in dev API Token button

  const handleCopyApiToken = async () => { // eslint-disable-line no-unused-vars -- used in dev API Token button
    if (!currentUser || isAnonymous) return;
    try {
      const token = await currentUser.getIdToken();
      await navigator.clipboard.writeText(token);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    } catch (err) {
      reportError('Failed to copy token', { error: err });
    }
  };

  useEffect(() => {
    const handleOpenSignIn = (event) => {
      const mode = event.detail?.mode || 'login';
      setSignInMode(mode);
      setShowSignIn(true);
    };

    window.addEventListener('openSignIn', handleOpenSignIn);
    return () => window.removeEventListener('openSignIn', handleOpenSignIn);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      reportError('Failed to log out', { error });
    }
  };

  return (
    <>
      <header
        className="header-full-width backdrop-blur-sm shadow-lg min-h-14 sm:min-h-[72px] flex items-center"
        style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6)' }}
      >
        <div className="w-full px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 sm:gap-3 min-w-0"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-teal-600 font-bold text-sm sm:text-lg">S</span>
                </div>
                <h1 className="text-base sm:text-xl font-bold text-white truncate">SurveyMage</h1>
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {currentUser && (
                isAnonymous ? (
                  <button
                    onClick={() => setShowSignIn(true)}
                    className="px-3 sm:px-5 py-2 bg-white text-teal-700 rounded-lg hover:bg-teal-50 transition-colors flex items-center gap-2 font-medium shadow-sm text-sm sm:text-base"
                  >
                    <User className="w-4 h-4 shrink-0" />
                    Sign In
                  </button>
                ) : (
                  <>
                    {process.env.NODE_ENV === 'development' && (
                      <button
                        onClick={handleCopyApiToken}
                        className="px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2 font-medium text-sm"
                        title="Copy API token for Swagger (http://localhost:5000/api-docs)"
                      >
                        <Key className="w-4 h-4 shrink-0" />
                        {tokenCopied ? 'Copied!' : 'API Token'}
                      </button>
                    )}
                    <div className="hidden sm:flex items-center gap-2 text-white bg-white/20 px-3 py-2 rounded-lg max-w-[180px] lg:max-w-[220px]" title={currentUser?.email || ''}>
                      <User className="w-5 h-5 shrink-0" aria-hidden />
                      <span className="text-sm font-medium truncate">
                        {currentUser?.displayName?.trim() || (currentUser?.email ? currentUser.email.split('@')[0] : null) || currentUser?.email || 'User'}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-3 sm:px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2 font-medium text-sm sm:text-base"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span className="hidden sm:inline">Sign Out</span>
                    </button>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      {showSignIn && (
        <SignIn
          onClose={() => setShowSignIn(false)}
          initialMode={signInMode}
        />
      )}
    </>
  );
}

export default NavBar;