import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Loader, CheckCircle, BarChart3, Link2 } from 'lucide-react';
import QuestionDesigner from './QuestionDesigner';
import SurveyPreview from './SurveyPreview';
import Loading from './Loading';
import { getSurveyById, updateSurvey, createSurvey } from '../utils/serverComm';
import { useAuth } from '../contexts/AuthContext';
import { generateId } from '../utils/idUtils';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

function SurveyDesigner() {
  const { id: surveyId } = useParams();
  const navigate = useNavigate();
  const { isAnonymous } = useAuth();
  const isNewSurvey = surveyId === 'new' || !surveyId || String(surveyId) === 'undefined';

  // Helper function to get default title
  const getDefaultTitle = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    return `New Survey (${month}/${day}/${year})`;
  };

  const [title, setTitle] = useState(getDefaultTitle());
  const [questions, setQuestions] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(!!surveyId && !isNewSurvey);

  useEffect(() => {
    if (!surveyId || isNewSurvey) return;
    let cancelled = false;
    setLoading(true);
    getSurveyById(surveyId)
      .then((res) => {
        if (cancelled) return;
        const survey = res.data;
        setSaveStatus('idle');
        if (survey?.title) setTitle(survey.title);
        if (survey?.description !== undefined) setDescription(survey.description || '');
        if (typeof survey?.isOpen === 'boolean') setIsOpen(survey.isOpen);
        if (survey?.questions?.length) {
          const loadedQuestions = survey.questions.map((q, i) => ({
            id: q?.id ? String(q.id) : generateId(),
            type: q.type || 'short-text',
            questionText: q.questionText || '',
            options: Array.isArray(q.options) ? q.options : [],
            required: !!q.required
          }));
          setQuestions(loadedQuestions);
        }
      })
      .catch(() => {
        if (!cancelled) navigate('/');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [surveyId, isNewSurvey, navigate]);
  const [description, setDescription] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [saveError, setSaveError] = useState('');
  const [copyToClipboard, showCopied] = useCopyToClipboard();
  const [statusSaveState, setStatusSaveState] = useState('idle'); // idle | saving | saved
  const previewRef = useRef(null);

  const handleIsOpenChange = async (e) => {
    const next = e.target.checked;
    if (!next && !window.confirm('Close this survey? It will stop accepting new responses.')) return;
    setIsOpen(next);
    if (isNewSurvey || !surveyId) return;
    if (isAnonymous) return;
    setStatusSaveState('saving');
    try {
      await updateSurvey(surveyId, { isOpen: next });
      setStatusSaveState('saved');
      setTimeout(() => setStatusSaveState('idle'), 2000);
    } catch (err) {
      setIsOpen(!next); // revert on error
      setSaveError(err.message || 'Failed to update status');
      setStatusSaveState('idle');
    }
  };

  const handleCopySurveyLink = () => {
    if (isNewSurvey || !surveyId) return;
    const url = `${window.location.origin}/s/${surveyId}`;
    copyToClipboard(url).then((ok) => !ok && alert('Failed to copy link'));
  };

  const handleAddQuestion = (questionData) => {
    const newQuestion = {
      ...questionData,
      id: generateId()
    };
    setQuestions([...questions, newQuestion]);
    
    setTimeout(() => {
      if (previewRef.current) {
        previewRef.current.scrollTo({
          top: previewRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleDeleteQuestion = (questionId) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleReorderQuestions = (newQuestions) => {
    setQuestions(newQuestions);
  };

  const handleUpdateQuestion = (questionId, updates) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      )
    );
  };

  const handleSaveSurvey = async () => {
    if (isAnonymous) {
      window.dispatchEvent(new CustomEvent('openSignIn', { detail: { mode: 'login' } }));
      return;
    }
    if (questions.length === 0) {
      alert('Please add at least one question before saving');
      return;
    }
    if (!title.trim()) {
      alert('Please enter a survey title');
      return;
    }
    setSaveError('');
    setSaveStatus('saving');
    try {
      const surveyData = {
        title: title.trim(),
        description: description.trim(),
        isOpen,
        questions: questions.map((q) => {
          const opts = Array.isArray(q.options) ? q.options : [];
          const filteredOpts = (q.type === 'multiple-choice' || q.type === 'checkbox')
            ? opts.filter((o) => o != null && String(o).trim()).map((o) => String(o).trim())
            : opts;
          return {
            id: q?.id ? String(q.id) : generateId(),
            type: q.type,
            questionText: (q.questionText || '').trim(),
            options: filteredOpts,
            required: !!q.required
          };
        })
      };
      let targetId = surveyId;
      if (isNewSurvey) {
        const created = await createSurvey();
        targetId = created?.surveyId;
        if (!targetId || String(targetId) === 'undefined') {
          throw new Error('Create survey failed: no ID returned');
        }
        await updateSurvey(targetId, surveyData);
        navigate(`/survey/${targetId}`);
      } else {
        await updateSurvey(surveyId, surveyData);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveError(err.message || 'Failed to save');
      setSaveStatus('idle');
    }
  };

  const handleAnalyzeResponses = () => {
    if (isNewSurvey || !surveyId) {
      alert('Save the survey first to view analytics.');
      return;
    }
    navigate(`/survey/${surveyId}/analytics`);
  };

  const renderSaveButtonContent = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>Saving...</span>
          </>
        );
      case 'saved':
        return (
          <>
            <CheckCircle className="w-5 h-5" />
            <span>Saved!</span>
          </>
        );
      default:
        return (
          <>
            <Save className="w-5 h-5" />
            <span>Save</span>
          </>
        );
    }
  };

  const getSaveButtonClassName = () => {
    const baseClasses = "flex-1 px-4 py-3 text-white font-medium rounded-md transition-all flex items-center justify-center gap-2 border";
    
    switch (saveStatus) {
      case 'saving':
        return `${baseClasses} bg-teal-600 border-teal-700 cursor-wait`;
      case 'saved':
        return `${baseClasses} bg-emerald-700 border-emerald-800`;
      default:
        return `${baseClasses} bg-teal-600 border-teal-700 hover:bg-teal-700 active:bg-teal-800`;
    }
  };

  if (loading) {
    return <Loading message="Loading survey..." className="flex-1 min-h-0 bg-white" />;
  }

  return (
    <div className="flex-1 min-h-0 p-4 sm:p-6 lg:p-8 bg-white relative">
      {showCopied && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg shadow-lg animate-fade-in">
          Copied!
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 min-w-0">
          <div className="w-full lg:w-1/3 space-y-4 sm:space-y-5 min-w-0">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
              <label htmlFor="survey-title" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Survey Details</label>
              <input
                id="survey-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter survey title..."
                aria-label="Survey title"
                className="w-full text-lg sm:text-xl font-semibold text-slate-900 border border-slate-200 rounded-md px-3 py-2 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none placeholder-slate-400 min-w-0"
              />
              <input
                id="survey-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                aria-label="Survey description"
                className="w-full mt-4 text-sm text-slate-600 border border-slate-200 rounded-md px-3 py-2 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none placeholder-slate-400 min-w-0"
              />
              {!isNewSurvey && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  <input
                    type="checkbox"
                    id="isOpen"
                    checked={isOpen}
                    onChange={handleIsOpenChange}
                    disabled={statusSaveState === 'saving'}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 disabled:opacity-60"
                  />
                  <label htmlFor="isOpen" className="text-sm font-medium text-slate-600 flex-1">Survey open (accepting responses)</label>
                  {statusSaveState === 'saving' && <span className="text-xs text-slate-500">Saving...</span>}
                  {statusSaveState === 'saved' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                </div>
              )}
            </div>

            {saveError && <p className="text-sm text-red-600">{saveError}</p>}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSaveSurvey}
                disabled={questions.length === 0 || saveStatus === 'saving' || !title.trim()}
                className={getSaveButtonClassName()}
                aria-label="Save survey"
              >
                {renderSaveButtonContent()}
              </button>
              <button
                onClick={handleAnalyzeResponses}
                className="flex-1 px-4 py-3 bg-slate-700 text-white font-medium rounded-md hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 border border-slate-600"
                aria-label="View analytics"
              >
                <BarChart3 className="w-5 h-5 shrink-0" />
                <span>Analyze</span>
              </button>
              {!isNewSurvey && surveyId && (
                <button
                  onClick={handleCopySurveyLink}
                  className="px-4 py-3 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 border border-teal-700"
                  title="Copy survey link"
                  aria-label="Copy survey link"
                >
                  <Link2 className="w-5 h-5 shrink-0" aria-hidden />
                  <span>Copy link</span>
                </button>
              )}
            </div>

            <QuestionDesigner onAddQuestion={handleAddQuestion} />
          </div>

          <div className="w-full lg:w-2/3 min-w-0">
            <SurveyPreview
              questions={questions}
              onDeleteQuestion={handleDeleteQuestion}
              onReorderQuestions={handleReorderQuestions}
              onUpdateQuestion={handleUpdateQuestion}
              previewRef={previewRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SurveyDesigner;