import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, BarChart3, MessageSquare, FileQuestion, Download } from 'lucide-react';
import WidgetDesigner from './WidgetDesigner';
import DashboardView from './DashboardView';
import Loading from './Loading';
import { getSurveyResponses, updateSurvey } from '../utils/serverComm';
import { useError } from '../contexts/ErrorContext';
import { generateId } from '../utils/idUtils';

function DashboardDesigner() {
  const { id: surveyId } = useParams();
  const navigate = useNavigate();
  const { reportError } = useError();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [dashboardTitle, setDashboardTitle] = useState('');
  const previewRef = useRef(null);

  useEffect(() => {
    if (!surveyId) return;
    let cancelled = false;
    setLoading(true);
    getSurveyResponses(surveyId)
      .then((res) => {
        if (cancelled) return;
        setData(res.data);
        const defaultTitle = res.data?.survey?.title || '';
        const serverConfig = res.data?.survey?.dashboardConfig;
        if (serverConfig && (serverConfig.title || (Array.isArray(serverConfig.widgets) && serverConfig.widgets.length > 0))) {
          setDashboardTitle(serverConfig.title || defaultTitle);
          if (Array.isArray(serverConfig.widgets) && serverConfig.widgets.length > 0) setWidgets(serverConfig.widgets);
        } else {
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
        }
      })
      .catch(() => {
        if (!cancelled) navigate('/');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [surveyId, navigate]);

  const survey = data?.survey;
  const responses = data?.responses || [];
  const questions = survey?.questions || [];
  const handleSaveDashboard = async () => {
    const config = { title: dashboardTitle, widgets };
    try {
      await updateSurvey(surveyId, { dashboardConfig: config });
    } catch (err) {
      reportError('Failed to sync dashboard to server', { error: err });
    }
  };

  const handleExportCSV = () => {
    const questions = survey?.questions || [];
    const escape = (s) => `"${String(s).replace(/"/g, '""')}"`;
    const headers = ['Submitted At', ...questions.map((q) => escape(q.questionText || q.id || 'Q'))];
    const rows = responses.map((r) => {
      const submittedAt = r.submittedAt ? new Date(r.submittedAt).toISOString() : '';
      const answers = (r.answers || []).reduce((acc, a) => {
        acc[a.questionId] = a.value;
        return acc;
      }, {});
      const cells = [
        escape(submittedAt),
        ...questions.map((q) => {
          const v = answers[q.id];
          if (v === undefined || v === null) return '';
          const str = Array.isArray(v) ? v.join('; ') : String(v);
          return escape(str);
        })
      ];
      return cells.join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `responses-${surveyId}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
    return <Loading message="Loading analytics..." className="flex-1 min-h-0 bg-slate-50" />;
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
            onClick={handleExportCSV}
            disabled={responses.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/80 text-teal-700 font-semibold rounded-lg hover:bg-teal-50 transition-all shadow-md hover:shadow-lg shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
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
