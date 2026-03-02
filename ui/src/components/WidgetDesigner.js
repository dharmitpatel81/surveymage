import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import WidgetDisplay from './WidgetDisplay';

const WIDGET_TYPES = [
  { value: 'bar', label: 'Bar Chart', forChoice: true, forNumeric: true, forText: false },
  { value: 'pie', label: 'Pie Chart', forChoice: true, forNumeric: false, forText: false },
  { value: 'donut', label: 'Donut Chart', forChoice: true, forNumeric: false, forText: false },
  { value: 'line', label: 'Line Chart', forChoice: false, forNumeric: true, forText: false },
  { value: 'area', label: 'Area Chart', forChoice: false, forNumeric: true, forText: false },
  { value: 'stat-card', label: 'Stat Card', forChoice: true, forNumeric: true, forText: true },
  { value: 'table', label: 'Data Table', forChoice: true, forNumeric: true, forText: true }
];

function WidgetDesigner({ questions = [], responses = [], onAddWidget }) {
  const [widgetType, setWidgetType] = useState('bar');
  const [widgetTitle, setWidgetTitle] = useState('');
  const [questionId, setQuestionId] = useState('');

  const chartableQuestions = questions.filter(
    (q) => q.type === 'multiple-choice' || q.type === 'checkbox' || q.type === 'numeric' || q.type === 'short-text' || q.type === 'long-text'
  );
  const selectedQuestion = questions.find((q) => String(q.id) === String(questionId));
  const isChoice = selectedQuestion && (selectedQuestion.type === 'multiple-choice' || selectedQuestion.type === 'checkbox');
  const isNumeric = selectedQuestion?.type === 'numeric';
  const isText = selectedQuestion && (selectedQuestion.type === 'short-text' || selectedQuestion.type === 'long-text');

  const availableTypes = WIDGET_TYPES.filter((t) => {
    if (isChoice) return t.forChoice;
    if (isNumeric) return t.forNumeric;
    if (isText) return t.forText;
    return true;
  });
  const effectiveType = availableTypes.some((t) => t.value === widgetType) ? widgetType : (availableTypes[0]?.value || 'bar');

  const handleAddWidget = (e) => {
    e?.preventDefault?.();
    if (!widgetTitle.trim()) return;
    if (!questionId) {
      alert('Please select a question');
      return;
    }

    const widgetData = {
      type: 'chart',
      questionId: String(questionId),
      chartType: effectiveType,
      title: widgetTitle.trim(),
      size: 'medium'
    };

    onAddWidget(widgetData);

    setWidgetTitle('');
    setQuestionId('');
    setWidgetType('bar');
  };

  return (
    <div className="p-6 text-left">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-slate-500 uppercase tracking-wider">Widget Designer</h2>
        <p className="text-slate-400 text-sm mt-0.5">Create charts and visualizations from your survey data</p>
      </div>

      <form onSubmit={handleAddWidget} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Widget Type</label>
          <select
            value={effectiveType}
            onChange={(e) => setWidgetType(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg text-slate-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          >
            {availableTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Widget Title</label>
          <input
            type="text"
            value={widgetTitle}
            onChange={(e) => setWidgetTitle(e.target.value)}
            placeholder="Enter widget title"
            required
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg text-slate-900 bg-white shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Question</label>
          <select
            value={questionId}
            onChange={(e) => setQuestionId(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg text-slate-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          >
            <option value="">Select a question</option>
            {chartableQuestions.map((q) => (
              <option key={q.id} value={q.id}>{q.questionText || q.type}</option>
            ))}
          </select>
        </div>

        {selectedQuestion && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Preview</h3>
            {widgetTitle.trim() && (
              <p className="text-sm text-slate-600 mb-3">{widgetTitle.trim()}</p>
            )}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <WidgetDisplay
                question={selectedQuestion}
                responses={responses}
                chartType={effectiveType}
                title={widgetTitle.trim() || undefined}
                compact
                legendPosition="top"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!questionId || chartableQuestions.length === 0}
          className="w-full px-4 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-500 transition-all shadow-md hover:shadow-lg ring-2 ring-teal-400/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:ring-0"
        >
          <Plus className="w-4 h-4" />
          Add to dashboard
        </button>
      </form>
    </div>
  );
}

export default WidgetDesigner;
