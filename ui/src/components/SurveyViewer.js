import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Loader, CheckCircle2 } from 'lucide-react';
import { getPublicSurveyById, submitSurveyResponse, checkSubmission } from '../utils/serverComm';
import { useAuth } from '../contexts/AuthContext';
import QuestionPreview from './QuestionPreview';

const ANON_KEY = 'surveymage_anonymous_id';
const SUBMITTED_KEY = 'surveymage_submitted';

function getOrCreateAnonymousId() {
  let id = localStorage.getItem(ANON_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANON_KEY, id);
  }
  return id;
}

function hasSubmittedLocally(surveyId) {
  try {
    const raw = localStorage.getItem(SUBMITTED_KEY);
    if (!raw) return false;
    const ids = JSON.parse(raw);
    return Array.isArray(ids) && ids.includes(surveyId);
  } catch {
    return false;
  }
}

function markSubmittedLocally(surveyId) {
  try {
    const raw = localStorage.getItem(SUBMITTED_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    if (!ids.includes(surveyId)) {
      ids.push(surveyId);
      localStorage.setItem(SUBMITTED_KEY, JSON.stringify(ids));
    }
  } catch {
    // ignore
  }
}

function SurveyViewer() {
  const { survey_id: surveyId } = useParams();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();

  // Allow ?mark=submitted to mark as done (for users who submitted before we added tracking)
  useEffect(() => {
    if (surveyId && searchParams.get('mark') === 'submitted') {
      markSubmittedLocally(surveyId);
    }
  }, [surveyId, searchParams]);

  const [loading, setLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle | submitting | submitted
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [error, setError] = useState('');
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});

  const submittedBy = currentUser?.uid ?? getOrCreateAnonymousId();

  const questions = useMemo(() => (survey?.questions || []).map((q) => ({
    id: String(q.id),
    type: q.type,
    questionText: q.questionText,
    options: Array.isArray(q.options) ? q.options : [],
  })), [survey]);

  useEffect(() => {
    let cancelled = false;
    setError('');
    setLoading(true);
    setSubmitStatus('idle');
    setAlreadySubmitted(false);

    if (hasSubmittedLocally(surveyId)) {
      setAlreadySubmitted(true);
      setLoading(false);
      return;
    }

    checkSubmission(surveyId, submittedBy)
      .then((res) => {
        if (cancelled) return;
        if (res.submitted) {
          setAlreadySubmitted(true);
          markSubmittedLocally(surveyId);
          setLoading(false);
          return;
        }
        return getPublicSurveyById(surveyId);
      })
      .then((res) => {
        if (cancelled || !res) return;
        const s = res.data;
        setSurvey(s);

        const initial = {};
        for (const q of s.questions || []) {
          const qid = String(q.id);
          if (q.type === 'checkbox') initial[qid] = [];
          else initial[qid] = '';
        }
        setAnswers(initial);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load survey');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [surveyId, submittedBy]);

  const setAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleCheckbox = (questionId, option) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      const exists = current.includes(option);
      const next = exists ? current.filter((x) => x !== option) : [...current, option];
      return { ...prev, [questionId]: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!surveyId) return;

    setError('');
    setSubmitStatus('submitting');
    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        value: answers[q.id],
      }));
      const res = await submitSurveyResponse(surveyId, payload, submittedBy);
      setSubmitStatus('submitted');
      setAlreadySubmitted(true);
      markSubmittedLocally(surveyId);
    } catch (err) {
      setError(err.message || 'Failed to submit');
      setSubmitStatus('idle');
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

  if (error) {
    return (
      <div className="flex-1 min-h-0 bg-white px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitStatus === 'submitted' || alreadySubmitted) {
    return (
      <div className="flex-1 min-h-0 bg-white px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Thank you for your response!</h2>
            <p className="text-sm text-slate-600 mt-2">
              {alreadySubmitted ? 'You have already submitted a response for this survey.' : 'Your submission was received successfully.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 bg-white px-4 py-6 sm:py-10">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
              {survey?.title || 'Survey'}
            </h1>
            {!!survey?.description && (
              <p className="text-sm text-slate-600 mt-2">{survey.description}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Question {idx + 1}
                </p>
                <QuestionPreview
                  question={q}
                  readOnly
                  value={answers[q.id]}
                  onChange={(val) => {
                    if (q.type === 'checkbox') toggleCheckbox(q.id, val);
                    else setAnswer(q.id, val);
                  }}
                />
              </div>
            ))}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitStatus === 'submitting'}
              className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 active:bg-teal-800 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitStatus === 'submitting' ? 'Submitting...' : 'Submit Survey'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SurveyViewer;

