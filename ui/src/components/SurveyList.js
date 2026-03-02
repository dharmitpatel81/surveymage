import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader, Lock, BarChart3 } from 'lucide-react';
import { getSurveys } from '../utils/serverComm';
import { useAuth } from '../contexts/AuthContext';

function SurveyList() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, isAnonymous } = useAuth();

  const loadSurveys = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getSurveys();
      setSurveys(response.data || []);
    } catch (err) {
      console.error('Failed to load surveys:', err);
      setError(err.message || 'Failed to load surveys');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const isLoggedIn = currentUser && !isAnonymous && currentUser.uid;
    if (isLoggedIn) {
      loadSurveys();
    } else {
      setLoading(false);
    }
  }, [currentUser, isAnonymous, loadSurveys]);

  const handleNewSurvey = () => {
    navigate('/survey/new');
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center page-bg-teal px-4">
        <div className="text-center">
          <Loader className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium text-sm sm:text-base">Loading surveys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] pt-6 sm:pt-10 pb-8 px-3 sm:px-6 lg:px-8 page-bg-teal">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-0.5 sm:mb-1">My Surveys</h1>
          <p className="text-xs sm:text-sm text-slate-500">Create and manage your surveys</p>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-red-50 border-l-4 border-red-500 rounded-lg sm:rounded-xl">
            <p className="text-red-700 font-medium text-sm sm:text-base">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={handleNewSurvey}
            className="animate-card-enter rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 flex items-center justify-center gap-2 sm:gap-3 min-h-[100px] sm:min-h-0 transition-all duration-200 hover:-translate-y-0.5 sm:hover:-translate-y-1 shadow-sm hover:shadow-lg bg-gradient-to-br from-teal-50 to-teal-100"
          >
            <Plus className="w-5 h-5 text-teal-600 shrink-0" strokeWidth={2.5} />
            <span className="text-sm sm:text-base font-semibold text-teal-600">New Survey</span>
          </button>

          {surveys.map((survey, index) => (
            <div
              key={survey._id}
              onClick={() => navigate(`/survey/${survey._id}`)}
              className="animate-card-enter rounded-xl sm:rounded-2xl border border-teal-200 p-4 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 sm:hover:-translate-y-1 shadow-sm hover:shadow-lg bg-white hover:bg-teal-50/30 flex items-start gap-3 cursor-pointer"
              style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
            >
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                  {survey.title || 'Untitled Survey'}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {survey.questionCount ?? survey.questions?.length ?? 0} question{(survey.questionCount ?? survey.questions?.length ?? 0) !== 1 ? 's' : ''}
                  {' · '}
                  {survey.responseCount ?? 0} response{(survey.responseCount ?? 0) !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/survey/${survey._id}/analytics`);
                }}
                className="shrink-0 p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                title="View analytics"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {surveys.length === 0 && !error && !isAnonymous && (
          <div className="text-center py-12 sm:py-16 text-slate-500">
            <p className="text-base sm:text-lg px-4">No surveys yet. Click &quot;New Survey&quot; to create your first one!</p>
          </div>
        )}

        {isAnonymous && (
          <div className="text-center py-6 sm:py-8">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openSignIn', { detail: { mode: 'login' } }))}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs sm:text-sm font-medium hover:bg-teal-100 hover:border-teal-300 transition-colors"
            >
              <Lock className="w-4 h-4 text-teal-600 shrink-0" />
              Sign in to save your survey and access it later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SurveyList;