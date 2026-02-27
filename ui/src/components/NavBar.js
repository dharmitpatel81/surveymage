import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import SignIn from './SignIn';

function NavBar() {
  const { currentUser, logout, isAnonymous } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary-600 font-bold text-lg">S</span>
              </div>
              <h1 className="text-xl font-bold text-white">SurveyMage</h1>
            </div>

            <div className="flex items-center gap-4">
              {currentUser && (
                <>
                  {isAnonymous ? (
                    <button
                      onClick={() => setShowSignIn(true)}
                      className="px-5 py-2 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-2 font-medium shadow-sm"
                    >
                      <User className="w-4 h-4" />
                      Sign In
                    </button>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-white bg-primary-500 bg-opacity-30 px-4 py-2 rounded-lg">
                        <User className="w-5 h-5" />
                        <span className="text-sm font-medium">{currentUser.email || 'User'}</span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-primary-500 bg-opacity-30 text-white rounded-lg hover:bg-opacity-50 transition-colors flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showSignIn && <SignIn onClose={() => setShowSignIn(false)} />}
    </>
  );
}

export default NavBar;