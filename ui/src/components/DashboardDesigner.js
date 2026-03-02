import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, ArrowLeft, Save, BarChart3, MessageSquare, FileQuestion } from 'lucide-react';
import WidgetDesigner from './WidgetDesigner';
import DashboardView from './DashboardView';
import { getSurveyResponses } from '../utils/serverComm';
import { generateId } from '../utils/idUtils';

function DashboardDesigner() {
  const { id: surveyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const previewRef = useRef(null);

  useEffect(() => {
    if (!surveyId) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    getSurveyResponses(surveyId)
      .then((res) => {
        if (cancelled) return;
        setData(res.data);
        const defaultTitle = res.data?.survey?.title || '';
        const saved = localStorage.getItem(`dashboard-${surveyId}`);
        if (saved) {
          try {
            const { title, widgets: savedWidgets } = JSON.parse(saved);
            setDashboardTitle(title || defaultTitle);
            if (Array.isArray(savedWidgets) && savedWidgets.length > 0) setWidgets(savedWidgets);
          } catch {
            setDashboardTitle(defaultTitle);
          }
        } else {
          setDashboardTitle(defaultTitle);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load analytics');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [surveyId]);

  const survey = data?.survey;
  const responses = data?.responses || [];
  const questions = survey?.questions || [];
  const [dashboardTitle, setDashboardTitle] = useState('');
  const handleSaveDashboard = () => {
    const config = { title: dashboardTitle, widgets };
    localStorage.setItem(`dashboard-${surveyId}`, JSON.stringify(config));
  };

  const handleAddWidget = (widgetData) => {
    const newWidget = {
      ...widgetData,
      id: generateId()
    };
    setWidgets([...widgets, newWidget]);

    setTimeout(() => {
      if (previewRef.current) {
        previewRef.current.scrollTo({
          top: previewRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleDeleteWidget = (widgetId) => {
    setWidgets(widgets.filter((w) => w.id !== widgetId));
  };

  const handleReorderWidgets = (newWidgets) => {
    setWidgets(newWidgets);
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <Loader className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium text-sm sm:text-base">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-h-0 bg-white px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 flex items-center gap-2 text-teal-600 hover:text-teal-700"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>
    );
  }

  const surveyTitle = survey?.title || 'Untitled Survey';
  const responseCount = responses.length;
  const questionCount = questions.length;

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-slate-50/80">
      {/* Analytics header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-4 shrink-0"
        style={{
          background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
          boxShadow: '0 4px 24px rgba(13, 148, 136, 0.3)'
        }}
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="min-w-0">
            <p className="text-xs font-medium text-teal-100 uppercase tracking-wider mb-0.5">Analytics Dashboard</p>
            <h1 className="text-lg sm:text-xl font-bold text-white truncate" title={surveyTitle}>
              {surveyTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
          <div className="flex items-center gap-4 text-white">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
              <MessageSquare className="w-4 h-4 text-teal-100" />
              <span className="text-sm font-semibold">{responseCount}</span>
              <span className="text-xs text-teal-100">responses</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
              <FileQuestion className="w-4 h-4 text-teal-100" />
              <span className="text-sm font-semibold">{questionCount}</span>
              <span className="text-xs text-teal-100">questions</span>
            </div>
          </div>
          <button
            onClick={handleSaveDashboard}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-teal-700 font-semibold rounded-lg hover:bg-teal-50 transition-all shadow-md hover:shadow-lg shrink-0"
          >
            <Save className="w-5 h-5" />
            Save Dashboard
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        {questions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">No questions in this survey yet.</p>
              <p className="text-slate-500 text-sm mt-1">Add questions to create analytics widgets.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Left: Widget Designer ~1/3 */}
            <aside className="w-full lg:w-[360px] xl:w-[400px] border-r border-slate-200/80 bg-white shadow-sm shrink-0 overflow-y-auto">
              <WidgetDesigner questions={questions} responses={responses} onAddWidget={handleAddWidget} />
            </aside>

            {/* Right: Dashboard Preview ~2/3 */}
            <main className="flex-1 min-w-0 flex flex-col overflow-hidden bg-slate-50/50">
              <DashboardView
                surveyTitle={surveyTitle}
                widgets={widgets}
                questions={questions}
                responses={responses}
                onDeleteWidget={handleDeleteWidget}
                onReorderWidgets={handleReorderWidgets}
                previewRef={previewRef}
              />
            </main>
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardDesigner;
