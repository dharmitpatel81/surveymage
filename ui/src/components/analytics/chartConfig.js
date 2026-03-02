import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  ChartDataLabels
);

// Professional business palette - distinct, readable, colorful
export const CHART_COLORS_BUSINESS = [
  '#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899',
  '#06b6d4', '#6366f1', '#f97316', '#14b8a6', '#a855f7', '#84cc16'
];

export const createAreaGradient = (canvasCtx) => {
  if (!canvasCtx || !canvasCtx.createLinearGradient) return 'rgba(13, 148, 136, 0.25)';
  const gradient = canvasCtx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(13, 148, 136, 0.35)');
  gradient.addColorStop(1, 'rgba(13, 148, 136, 0)');
  return gradient;
};

export const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 16,
        font: { family: 'system-ui', size: 12 }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleFont: { size: 13 },
      bodyFont: { size: 12 },
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => {
          const data = ctx.dataset?.data;
          if (!Array.isArray(data)) return `${ctx.label}: ${ctx.raw}`;
          const total = data.reduce((a, b) => a + b, 0);
          const pct = total > 0 ? ((Number(ctx.raw) / total) * 100).toFixed(1) : 0;
          return `${ctx.label}: ${ctx.raw} (${pct}%)`;
        }
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 }, color: '#64748b' }
    },
    y: {
      grid: { color: 'rgba(248, 250, 252, 0.8)' },
      ticks: { font: { size: 11 }, color: '#64748b' },
      border: { display: false }
    }
  }
};
