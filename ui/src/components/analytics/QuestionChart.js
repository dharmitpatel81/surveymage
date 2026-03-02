import React, { useMemo } from 'react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { CHART_COLORS_BUSINESS, defaultOptions, createAreaGradient } from './chartConfig';

const matchAnswer = (a, questionId) => String(a?.questionId ?? '') === String(questionId ?? '');

function aggregateByOption(responses, questionId, questionType) {
  const counts = {};
  for (const r of responses) {
    const ans = r.answers?.find((a) => matchAnswer(a, questionId));
    if (!ans) continue;
    const val = ans.value;
    if (questionType === 'checkbox' && Array.isArray(val)) {
      for (const v of val) {
        const key = String(v ?? '(empty)');
        counts[key] = (counts[key] || 0) + 1;
      }
    } else {
      const key = val != null && val !== '' ? String(val) : '(no answer)';
      counts[key] = (counts[key] || 0) + 1;
    }
  }
  return Object.entries(counts).map(([name, count]) => ({ name, count }));
}

function aggregateNumeric(responses, questionId) {
  const values = [];
  for (const r of responses) {
    const ans = r.answers?.find((a) => matchAnswer(a, questionId));
    if (ans == null || ans.value === '' || ans.value === undefined) continue;
    const num = Number(ans.value);
    if (!Number.isNaN(num)) values.push(num);
  }
  if (values.length === 0) return { values: [], min: null, max: null, avg: null };
  return {
    values,
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((a, b) => a + b, 0) / values.length
  };
}

const emptyState = (msg) => (
  <p className="text-sm text-slate-500 py-4">{msg}</p>
);

export default function QuestionChart({ question, responses, chartType = 'bar', legendPosition = 'bottom' }) {
  const isChoice = question.type === 'multiple-choice' || question.type === 'checkbox';
  const isNumeric = question.type === 'numeric';

  const choiceData = useMemo(() => {
    if (!isChoice) return [];
    return aggregateByOption(responses, question.id, question.type);
  }, [isChoice, responses, question.id, question.type]);

  const numericResult = useMemo(() => {
    if (!isNumeric) return null;
    return aggregateNumeric(responses, question.id);
  }, [isNumeric, responses, question.id]);

  const chartDataArr = useMemo(() => {
    if (!numericResult || numericResult.values.length === 0) return [];
    const { values, min, max } = numericResult;
    const buckets = {};
    const step = max - min > 0 ? Math.max(1, Math.ceil((max - min) / 5)) : 1;
    for (const v of values) {
      const bucket = step === 1 ? v : Math.floor((v - min) / step) * step + min;
      const key = step === 1 ? String(bucket) : `${bucket}-${bucket + step - 1}`;
      buckets[key] = (buckets[key] || 0) + 1;
    }
    return Object.entries(buckets)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => {
        const na = parseFloat(a.name);
        const nb = parseFloat(b.name);
        return (Number.isNaN(na) ? 0 : na) - (Number.isNaN(nb) ? 0 : nb);
      });
  }, [numericResult]);

  const choiceChartData = useMemo(() => {
    const colors = CHART_COLORS_BUSINESS;
    const isBar = chartType === 'bar';
    return {
      labels: choiceData.map((d) => d.name),
      datasets: [{
        data: choiceData.map((d) => d.count),
        backgroundColor: choiceData.map((_, i) => colors[i % colors.length]),
        borderColor: choiceData.map((_, i) => colors[i % colors.length]),
        borderWidth: 1,
        borderRadius: isBar ? 6 : 0,
        borderSkipped: false,
        hoverOffset: 8
      }]
    };
  }, [choiceData, chartType]);

  const numericChartData = useMemo(() => ({
    labels: chartDataArr.map((d) => d.name),
    datasets: [{
      label: 'Count',
      data: chartDataArr.map((d) => d.count),
      backgroundColor: chartDataArr.map((_, i) => CHART_COLORS_BUSINESS[i % CHART_COLORS_BUSINESS.length]),
      borderColor: chartDataArr.map((_, i) => CHART_COLORS_BUSINESS[i % CHART_COLORS_BUSINESS.length]),
      borderWidth: 1,
      borderRadius: 6,
      borderSkipped: false
    }]
  }), [chartDataArr]);

  if (isChoice) {
    if (choiceData.length === 0) return emptyState('No responses yet');

    const totalCount = choiceData.reduce((s, d) => s + d.count, 0);
    const topAnswer = choiceData[0];

    if (chartType === 'stat-card') {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-teal-50 to-white rounded-xl p-4 border border-teal-100/80 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Responses</p>
            <p className="text-2xl font-bold text-teal-600 mt-1">{totalCount}</p>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-white rounded-xl p-4 border border-teal-100/80 shadow-sm col-span-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Top Answer</p>
            <p className="text-lg font-semibold text-slate-800 mt-1 truncate">{topAnswer?.name || '—'}</p>
            <p className="text-sm text-slate-500 mt-0.5">{topAnswer ? `${topAnswer.count} (${((topAnswer.count / totalCount) * 100).toFixed(0)}%)` : ''}</p>
          </div>
        </div>
      );
    }

    if (chartType === 'table') {
      return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Option</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">Count</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">%</th>
              </tr>
            </thead>
            <tbody>
              {choiceData.map((row, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-slate-800">{row.name}</td>
                  <td className="px-4 py-3 text-right font-medium text-teal-600">{row.count}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{((row.count / totalCount) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    const totalCountPie = choiceData.reduce((s, d) => s + d.count, 0);
    const pieDatalabels = {
      formatter: (value) => (totalCountPie > 0 ? `${((value / totalCountPie) * 100).toFixed(1)}%` : ''),
      color: '#fff',
      font: { size: 12, weight: '600' },
      anchor: 'center',
      align: 'center'
    };
    const pieLegendLabels = {
      generateLabels: (chart) => {
        const data = chart.data;
        if (data.labels && data.datasets.length) {
          const ds = data.datasets[0];
          const total = Array.isArray(ds.data) ? ds.data.reduce((a, b) => a + b, 0) : 0;
          return data.labels.map((label, i) => ({
            text: `${label}: ${ds.data[i]} (${total > 0 ? ((ds.data[i] / total) * 100).toFixed(1) : 0}%)`,
            fillStyle: (Array.isArray(ds.backgroundColor) ? ds.backgroundColor[i] : ds.backgroundColor) || CHART_COLORS_BUSINESS[i % CHART_COLORS_BUSINESS.length],
            strokeStyle: '#fff',
            lineWidth: 1,
            index: i
          }));
        }
        return [];
      }
    };
    const pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 12 },
      plugins: {
        legend: {
          position: legendPosition,
          labels: { usePointStyle: true, padding: 12, font: { size: 11 } },
          ...pieLegendLabels
        },
        tooltip: defaultOptions.plugins.tooltip,
        datalabels: pieDatalabels
      },
      scales: {}
    };

    if (chartType === 'donut') {
      return (
        <div className="h-[280px] w-full">
          <Doughnut
            data={choiceChartData}
            options={{
              ...pieOptions,
              cutout: '60%',
              plugins: {
                ...pieOptions.plugins,
                legend: { ...pieOptions.plugins.legend, position: legendPosition }
              }
            }}
          />
        </div>
      );
    }

    if (chartType === 'pie') {
      return (
        <div className="h-[280px] w-full">
          <Pie data={choiceChartData} options={pieOptions} />
        </div>
      );
    }

    // Bar chart (horizontal for choice) - labels outside bars for visibility, count + %
    const barDatalabels = {
      formatter: (value) => {
        const total = totalCountPie;
        const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
        return `${value} (${pct}%)`;
      },
      anchor: 'end',
      align: 'start',
      offset: 8,
      color: '#0f172a',
      font: { size: 12, weight: '700' }
    };
    return (
      <div className="h-[280px] w-full min-w-0">
        <Bar
          data={choiceChartData}
          options={{
            ...defaultOptions,
            indexAxis: 'y',
            plugins: {
              ...defaultOptions.plugins,
              legend: { display: false },
              datalabels: barDatalabels
            },
            scales: {
              x: {
                ...defaultOptions.scales.x,
                grid: { color: 'rgba(248, 250, 252, 0.8)' },
                border: { display: false }
              },
              y: {
                ...defaultOptions.scales.y,
                grid: { display: false },
                ticks: { ...defaultOptions.scales.y.ticks, maxRotation: 0, autoSkip: false }
              }
            }
          }}
        />
      </div>
    );
  }

  if (isNumeric) {
    if (!numericResult || numericResult.values.length === 0) return emptyState('No numeric responses yet');

    const { values, min, max, avg } = numericResult;

    if (chartType === 'stat-card') {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-teal-50 to-white rounded-xl p-4 border border-teal-100/80 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Responses</p>
            <p className="text-2xl font-bold text-teal-600 mt-1">{values.length}</p>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-white rounded-xl p-4 border border-teal-100/80 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Average</p>
            <p className="text-2xl font-bold text-teal-600 mt-1">{avg.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-white rounded-xl p-4 border border-teal-100/80 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Min</p>
            <p className="text-2xl font-bold text-teal-600 mt-1">{min}</p>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-white rounded-xl p-4 border border-teal-100/80 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Max</p>
            <p className="text-2xl font-bold text-teal-600 mt-1">{max}</p>
          </div>
        </div>
      );
    }

    const statsBar = (
      <div className="flex flex-wrap gap-4 text-sm mb-3">
        <span className="text-slate-600">Min: <strong className="text-teal-600">{min}</strong></span>
        <span className="text-slate-600">Max: <strong className="text-teal-600">{max}</strong></span>
        <span className="text-slate-600">Avg: <strong className="text-teal-600">{avg.toFixed(2)}</strong></span>
      </div>
    );

    const outsideBarDatalabels = {
      formatter: (value) => value,
      anchor: 'end',
      align: 'start',
      offset: 8,
      color: '#0f172a',
      font: { size: 12, weight: '700' }
    };
    const lineDataset = {
      ...numericChartData.datasets[0],
      fill: true,
      backgroundColor: (ctx) => createAreaGradient(ctx?.chart?.ctx),
      borderColor: '#0d9488',
      borderWidth: 2,
      pointBackgroundColor: '#0d9488',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: chartType === 'line' ? 4 : 3,
      tension: chartType === 'line' ? 0.3 : 0.4
    };
    const lineChart = (
      <div>
        {statsBar}
        <div className="h-[220px]">
          <Line
            data={{ ...numericChartData, datasets: [lineDataset] }}
            options={{
              ...defaultOptions,
              plugins: {
                ...defaultOptions.plugins,
                legend: { display: false },
                datalabels: outsideBarDatalabels
              }
            }}
          />
        </div>
      </div>
    );
    if (chartType === 'line' || chartType === 'area') return lineChart;

    return (
      <div className="w-full min-w-0">
        {statsBar}
        <span className="text-slate-600 text-sm">Responses: <strong className="text-teal-600">{values.length}</strong></span>
        <div className="h-[220px] mt-2 w-full min-w-0">
          <Bar
            data={numericChartData}
            options={{
              ...defaultOptions,
              plugins: {
                ...defaultOptions.plugins,
                legend: { display: false },
                datalabels: outsideBarDatalabels
              }
            }}
          />
        </div>
      </div>
    );
  }

  // short-text, long-text
  const answers = responses
    .map((r) => r.answers?.find((a) => matchAnswer(a, question.id))?.value)
    .filter((v) => v != null && (Array.isArray(v) ? v.length > 0 : String(v).trim() !== ''));
  const sample = answers.slice(0, 5);
  const formatValue = (v) => (Array.isArray(v) ? v.join(', ') : String(v));

  if (chartType === 'stat-card') {
    return (
      <div className="bg-gradient-to-br from-teal-50 to-white rounded-xl p-4 border border-teal-100/80 shadow-sm">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Responses</p>
        <p className="text-2xl font-bold text-teal-600 mt-1">{answers.length}</p>
      </div>
    );
  }

  if (chartType === 'table') {
    return (
      <div className="space-y-2">
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm max-h-60 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur">
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-700">#</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Response</th>
              </tr>
            </thead>
            <tbody>
              {answers.map((s, i) => {
                const str = formatValue(s);
                return (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-2 text-slate-500 w-10">{i + 1}</td>
                    <td className="px-4 py-2 text-slate-800">{str.slice(0, 120)}{str.length > 120 ? '…' : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">{answers.length} total response{answers.length !== 1 ? 's' : ''}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-600">
        <strong>{answers.length}</strong> response{answers.length !== 1 ? 's' : ''}
      </p>
      {sample.length > 0 && (
        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
          {sample.map((s, i) => {
            const str = formatValue(s);
            return (
              <li key={i} className="truncate max-w-full">{str.slice(0, 80)}{str.length > 80 ? '…' : ''}</li>
            );
          })}
          {answers.length > 5 && (
            <li className="text-slate-500">+{answers.length - 5} more</li>
          )}
        </ul>
      )}
      {answers.length === 0 && <p className="text-sm text-slate-500">No responses yet</p>}
    </div>
  );
}
