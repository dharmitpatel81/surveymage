import React from 'react';
import QuestionChart from './analytics/QuestionChart';

/**
 * Pure widget display - renders chart/content without drag/delete controls.
 * Used for live preview in WidgetDesigner and can be reused for read-only dashboard views.
 * @param {boolean} compact - When true, omit title wrapper (parent provides it)
 */
function WidgetDisplay({ question, responses = [], chartType = 'bar', title, compact = false, legendPosition }) {
  if (!question) {
    return (
      <div className="bg-slate-50 rounded-lg border border-dashed border-slate-200 p-6 text-center">
        <p className="text-sm text-slate-400">Select a question to preview</p>
      </div>
    );
  }

  const chartContent = (
    <QuestionChart
      question={question}
      responses={responses}
      chartType={chartType}
      legendPosition={legendPosition}
    />
  );

  if (compact) {
    return <div className="flex-1 min-h-[220px] overflow-visible">{chartContent}</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col min-h-[180px]">
      <h3 className="text-sm font-semibold text-slate-800 mb-3 shrink-0">
        {title || question.questionText}
      </h3>
      <div className="flex-1 min-h-0">{chartContent}</div>
    </div>
  );
}

export default WidgetDisplay;
