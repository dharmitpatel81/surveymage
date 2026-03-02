import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Loader, CheckCircle, BarChart3 } from 'lucide-react';
import QuestionDesigner from './QuestionDesigner';
import SurveyPreview from './SurveyPreview';
import { getSurveyById, updateSurvey, createSurvey } from '../utils/serverComm';
import { useAuth } from '../contexts/AuthContext';
import { generateId } from '../utils/idUtils';

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
  const [loading, setLoading] = useState(!!surveyId && !isNewSurvey);

  useEffect(() => {
    if (!surveyId || isNewSurvey) return;
    let cancelled = false;
    setLoading(true);
    getSurveyById(surveyId)
      .then((res) => {
        if (cancelled) return;
        const survey = res.data;
        if (survey?.title) setTitle(survey.title);
        if (survey?.description !== undefined) setDescription(survey.description || '');
        if (survey?.questions?.length) {
          const loadedQuestions = survey.questions.map((q, i) => ({
            id: q?.id ? String(q.id) : generateId(),
            type: q.type || 'short-text',
            questionText: q.questionText || '',
            options: Array.isArray(q.options) ? q.options : []
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
  }, [surveyId, isNewSurvey]);
  const [description, setDescription] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [saveError, setSaveError] = useState('');
  const previewRef = useRef(null);

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
        questions: questions.map((q) => ({
          id: q?.id ? String(q.id) : generateId(),
          type: q.type,
          questionText: q.questionText || '',
          options: Array.isArray(q.options) ? q.options : []
        }))
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
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center bg-white px-4">
        <div className="text-center">
          <Loader className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium text-sm sm:text-base">Loading survey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 p-4 sm:p-6 lg:p-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 min-w-0">
          <div className="w-full lg:w-1/3 space-y-4 sm:space-y-5 min-w-0">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Survey Details</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter survey title..."
                className="w-full text-lg sm:text-xl font-semibold text-slate-900 border-0 border-b border-slate-200 focus:border-slate-400 focus:outline-none pb-2 transition-colors placeholder-slate-400 min-w-0"
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full mt-4 text-sm text-slate-600 border-0 border-b border-slate-100 focus:border-slate-400 focus:outline-none pb-2 transition-colors placeholder-slate-400 min-w-0"
              />
            </div>

            {saveError && <p className="text-sm text-red-600">{saveError}</p>}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSaveSurvey}
                disabled={questions.length === 0 || saveStatus === 'saving' || saveStatus === 'saved' || !title.trim()}
                className={getSaveButtonClassName()}
              >
                {renderSaveButtonContent()}
              </button>
              <button
                onClick={handleAnalyzeResponses}
                className="flex-1 px-4 py-3 bg-slate-700 text-white font-medium rounded-md hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 border border-slate-600"
              >
                <BarChart3 className="w-5 h-5 shrink-0" />
                <span>Analyze</span>
              </button>
            </div>

            <QuestionDesigner onAddQuestion={handleAddQuestion} />
          </div>

          <div className="w-full lg:w-2/3 min-w-0">
            <SurveyPreview
              questions={questions}
              onDeleteQuestion={handleDeleteQuestion}
              onReorderQuestions={handleReorderQuestions}
              previewRef={previewRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SurveyDesigner;