import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Loader, LogIn, UserPlus } from 'lucide-react';
import { updateSurvey } from '../utils/serverComm';
import { useAuth } from '../contexts/AuthContext';

function SaveSurveyModal({ questions, surveyId, surveyTitle, onClose, onSuccess, onSaving }) {
  const [title, setTitle] = useState(surveyTitle || '');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { isAnonymous } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    onSaving();

    try {
      const surveyData = {
        title: title.trim(),
        description: description.trim(),
        questions: questions.map((q, i) => ({
          id: q?.id ? String(q.id) : `${Date.now()}-${i}`,
          type: q.type,
          questionText: q.questionText || '',
          options: Array.isArray(q.options) ? q.options : []
        }))
      };

      await updateSurvey(surveyId, surveyData);
      
      setSuccess(true);
      
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to save survey. Please try again.');
      setLoading(false);
    }
  };

  const handleSignInRedirect = (mode = 'login') => {
    onClose();
    window.dispatchEvent(new CustomEvent('openSignIn', { 
      detail: { mode }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative border border-primary-100 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 hover:bg-gray-100 rounded-full p-1"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-primary-900 mb-2">
            Save Survey
          </h2>
          <p className="text-gray-600 text-sm">
            Give your survey a title and description
          </p>
        </div>

        {/* Anonymous User Warning */}
        {isAnonymous && (
          <div className="mb-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-r-lg shadow-sm animate-in slide-in-from-top duration-300">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-amber-900">
                  Account Required to Save
                </h3>
                <p className="mt-1 text-sm text-amber-800">
                  Create a free account or sign in to save and manage your surveys.
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => handleSignInRedirect('signup')}
                className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                Create Free Account
              </button>
              
              <button
                onClick={() => handleSignInRedirect('login')}
                className="w-full px-4 py-2.5 bg-white border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                Already have an account? Sign In
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && !isAnonymous && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm animate-in slide-in-from-top duration-300">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-red-800">
                  Unable to Save Survey
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>
              <button
                onClick={() => setError('')}
                className="ml-3 flex-shrink-0 text-red-400 hover:text-red-600 transition-colors hover:bg-red-100 rounded-full p-1"
                title="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg shadow-sm animate-in slide-in-from-top duration-300">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-green-800">
                  Success!
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  Your survey has been saved successfully.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-2">
              Survey Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading || success || isAnonymous}
              placeholder="e.g., Customer Satisfaction Survey"
              className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 mb-2">
              Description <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading || success || isAnonymous}
              placeholder="Brief description of your survey..."
              rows="3"
              className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-4 px-4 py-3 bg-primary-50 rounded-lg border border-primary-100">
              <span className="text-sm font-medium text-primary-900">
                Questions to save
              </span>
              <span className="text-lg font-bold text-primary-600">
                {questions.length}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || success || !title.trim() || isAnonymous}
              className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Survey</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SaveSurveyModal;