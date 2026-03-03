import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Lock, BarChart3, Link2, Trash2, Copy, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { getSurveys, deleteSurvey, getSurveyById, createSurvey, updateSurvey } from '../utils/serverComm';
import { useAuth } from '../contexts/AuthContext';
import { useError } from '../contexts/ErrorContext';
import { generateId } from '../utils/idUtils';
import { formatDate } from '../utils/dateUtils';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import Loading from './Loading';

function SurveyList() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copyToClipboard, showCopied] = useCopyToClipboard();
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date | title | responses
  const [sortDir, setSortDir] = useState('desc'); // asc | desc
  const { currentUser, isAnonymous } = useAuth();
  const { reportError } = useError();

  const filteredAndSorted = React.useMemo(() => {
    let list = surveys;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) =>
        (s.title || '').toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q)
      );
    }
    const dir = sortDir === 'asc' ? 1 : -1;
    list = [...list].sort((a, b) => {
      if (sortBy === 'date') {
        const da = new Date(a.createdAt || 0).getTime();
        const db = new Date(b.createdAt || 0).getTime();
        return (da - db) * dir;
      }
      if (sortBy === 'title') {
        const ta = (a.title || '').toLowerCase();
        const tb = (b.title || '').toLowerCase();
        return ta.localeCompare(tb) * dir;
      }
      if (sortBy === 'responses') {
        const ra = a.responseCount ?? 0;
        const rb = b.responseCount ?? 0;
        return (ra - rb) * dir;
      }
      return 0;
    });
    return list;
  }, [surveys, search, sortBy, sortDir]);

  const loadSurveys = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getSurveys();
      setSurveys(response.data || []);
    } catch (err) {
      reportError('Failed to load surveys', { error: err });
      setError(err.message || 'Failed to load surveys');
    } finally {
      setLoading(false);
    }
  }, [reportError]);

  useEffect(() => {
    const isLoggedIn = currentUser && !isAnonymous && currentUser.uid;
    if (isLoggedIn) {
      loadSurveys();
    } else {
      setSurveys([]);
      setError('');
      setLoading(false);
    }
  }, [currentUser, isAnonymous, loadSurveys]);

  const handleNewSurvey = () => {
    navigate('/survey/new');
  };

  const handleDeleteSurvey = async (e, surveyId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this survey? This cannot be undone.')) return;
    setDeletingId(surveyId);
    try {
      await deleteSurvey(surveyId);
      setSurveys((prev) => prev.filter((s) => s._id !== surveyId));
    } catch (err) {
      setError(err.message || 'Failed to delete survey');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyLink = (e, surveyId) => {
    e.stopPropagation();
    const url = `${window.location.origin}/s/${surveyId}`;
    copyToClipboard(url).then((ok) => !ok && alert('Failed to copy link'));
  };

  const handleDuplicateSurvey = async (e, surveyId) => {
    e.stopPropagation();
    try {
      const res = await getSurveyById(surveyId);
      const s = res.data;
      const created = await createSurvey();
      const newId = created.surveyId;
      await updateSurvey(newId, {
        title: (s.title || 'Untitled') + ' (copy)',
        description: s.description || '',
        questions: (s.questions || []).map((q) => ({
          id: generateId(),
          type: q.type,
          questionText: q.questionText || '',
          options: Array.isArray(q.options) ? q.options : [],
          required: !!q.required
        }))
      });
      loadSurveys();
      navigate(`/survey/${newId}`);
    } catch (err) {
      setError(err.message || 'Failed to duplicate survey');
    }
  };

  if (loading) {
    return <Loading message="Loading surveys..." className="page-bg-teal" />;
  }

  return (
    <div className="min-h-[50vh] pt-6 sm:pt-10 pb-8 px-3 sm:px-6 lg:px-8 page-bg-teal relative">
      {showCopied && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg shadow-lg animate-fade-in">
          Copied!
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-0.5 sm:mb-1">My Surveys</h1>
          <p className="text-xs sm:text-sm text-slate-500">Create and manage your surveys</p>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-red-50 border-l-4 border-red-500 rounded-lg sm:rounded-xl" role="alert" aria-live="polite">
            <p className="text-red-700 font-medium text-sm sm:text-base">{error}</p>
          </div>
        )}

        {surveys.length > 0 && (
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search surveys..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                <option value="date">Date</option>
                <option value="title">Title</option>
                <option value="responses">Responses</option>
              </select>
              <button
                onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortDir === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          <button
            onClick={handleNewSurvey}
            className="group rounded-2xl border-2 border-dashed border-teal-300 p-8 sm:p-10 flex flex-col items-center justify-center gap-3 min-h-[180px] transition-all duration-200 hover:border-teal-500 hover:bg-teal-50/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:ring-offset-2"
          >
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
              <Plus className="w-7 h-7 text-teal-600" strokeWidth={2.5} aria-hidden />
            </div>
            <span className="text-base font-semibold text-teal-700">New Survey</span>
            <span className="text-xs text-slate-500">Create a new survey from scratch</span>
          </button>

          {filteredAndSorted.map((survey, index) => (
            <article
              key={survey._id}
              onClick={() => !deletingId && navigate(`/survey/${survey._id}`)}
              className="animate-card-enter group rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-200 overflow-hidden cursor-pointer flex flex-col min-h-[180px]"
              style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
            >
              <div className="flex-1 p-5 sm:p-6 min-w-0">
                <h2 className="text-base font-semibold text-slate-900 leading-snug line-clamp-3 break-words">
                  {survey.title || 'Untitled Survey'}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                  <span>
                    {survey.questionCount ?? survey.questions?.length ?? 0} question{(survey.questionCount ?? survey.questions?.length ?? 0) !== 1 ? 's' : ''}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span>
                    {survey.responseCount ?? 0} response{(survey.responseCount ?? 0) !== 1 ? 's' : ''}
                  </span>
                  {survey.createdAt && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span>{formatDate(survey.createdAt)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end gap-0.5 px-4 py-3 bg-slate-50/80 border-t border-slate-100">
                <button
                  onClick={(e) => handleCopyLink(e, survey._id)}
                  className="p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                  title="Copy survey link"
                  aria-label="Copy survey link"
                >
                  <Link2 className="w-4 h-4" aria-hidden />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/survey/${survey._id}/analytics`);
                  }}
                  className="p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                  title="View analytics"
                  aria-label="View analytics"
                >
                  <BarChart3 className="w-4 h-4" aria-hidden />
                </button>
                <button
                  onClick={(e) => handleDuplicateSurvey(e, survey._id)}
                  className="p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                  title="Duplicate survey"
                  aria-label="Duplicate survey"
                >
                  <Copy className="w-4 h-4" aria-hidden />
                </button>
                <button
                  onClick={(e) => handleDeleteSurvey(e, survey._id)}
                  disabled={deletingId === survey._id}
                  className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete survey"
                  aria-label="Delete survey"
                >
                  <Trash2 className="w-4 h-4" aria-hidden />
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredAndSorted.length === 0 && !error && !isAnonymous && (
          <div className="text-center py-12 sm:py-16 text-slate-500">
            <p className="text-base sm:text-lg px-4">
              {surveys.length === 0
                ? 'No surveys yet. Click "New Survey" to create your first one!'
                : 'No surveys match your search.'}
            </p>
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