import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import WidgetDisplay from './WidgetDisplay';

const DEFAULT_SIZE = 'sm:col-span-1';
const SIZE_CLASSES = {
  small: DEFAULT_SIZE,
  medium: DEFAULT_SIZE,
  large: 'sm:col-span-2 xl:col-span-2'
};

function WidgetPreview({ widget, question, responses, onDeleteWidget }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sizeClass = SIZE_CLASSES[widget.size] || SIZE_CLASSES.medium;

  if (!question) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-white rounded-xl border border-slate-200 shadow-md p-4 sm:p-6 ${sizeClass}`}
      >
        <p className="text-sm text-slate-500">Question not found</p>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-200 p-5 sm:p-6 flex flex-col min-h-[280px] w-full min-w-0 overflow-visible ${sizeClass} ${
        isDragging ? 'z-50 shadow-xl ring-2 ring-teal-500/20' : ''
      }`}
    >
      <div className="flex items-start gap-2 mb-4 shrink-0">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-800">{widget.title || question.questionText}</h3>
        </div>
        <button
          onClick={() => {
            if (onDeleteWidget && window.confirm('Remove this widget from the dashboard?')) {
              onDeleteWidget(widget.id);
            }
          }}
          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
          title="Remove widget"
          aria-label="Remove widget"
        >
          <Trash2 className="w-5 h-5" aria-hidden />
        </button>
      </div>
      <div className="flex-1 min-h-[240px] overflow-visible">
        <WidgetDisplay
          question={question}
          responses={responses}
          chartType={widget.chartType || 'bar'}
          title={widget.title}
          compact
        />
      </div>
    </div>
  );
}

export default WidgetPreview;
