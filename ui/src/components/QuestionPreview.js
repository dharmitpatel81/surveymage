import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';

function renderQuestionInput(question, readOnly, value, onChange) {
  const options = Array.isArray(question.options) ? question.options : [];
  switch (question.type) {
    case 'multiple-choice':
      return (
        <div className="space-y-2">
          {options.map((option, idx) => (
            <label key={idx} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`question-${question.id}`}
                className="w-4 h-4 text-slate-600"
                checked={readOnly ? value === option : false}
                onChange={readOnly ? () => onChange && onChange(option) : undefined}
              />
              <span className="text-slate-700 text-sm">{option}</span>
            </label>
          ))}
        </div>
      );
    case 'checkbox':
      return (
        <div className="space-y-2">
          {options.map((option, idx) => (
            <label key={idx} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-slate-600 rounded border-slate-300"
                checked={readOnly && Array.isArray(value) ? value.includes(option) : false}
                onChange={readOnly && onChange ? () => onChange(option) : undefined}
              />
              <span className="text-slate-700 text-sm">{option}</span>
            </label>
          ))}
        </div>
      );
    case 'short-text':
      return (
        <input
          type="text"
          placeholder="Short answer"
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-left text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 text-sm"
          value={readOnly ? value || '' : ''}
          onChange={readOnly && onChange ? (e) => onChange(e.target.value) : undefined}
        />
      );
    case 'long-text':
      return (
        <textarea
          placeholder="Long answer"
          rows="4"
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-left text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 resize-y text-sm"
          value={readOnly ? value || '' : ''}
          onChange={readOnly && onChange ? (e) => onChange(e.target.value) : undefined}
        />
      );
    default:
      return null;
  }
}

// Viewer mode: no drag/delete, controlled inputs (used in SurveyViewer)
function QuestionContent({ question, value, onChange }) {
  return (
    <div className="pb-5 border-b border-slate-200 last:border-b-0 last:pb-0">
      <div className="flex items-start gap-2 sm:gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 mb-2 break-words">
            {question.questionText}
          </h3>
          <div className="mt-3">
            {renderQuestionInput(question, true, value, onChange)}
          </div>
        </div>
      </div>
    </div>
  );
}

// Builder mode: draggable with delete (only used inside DndContext in SurveyPreview)
function SortableQuestionPreview({ question, onDeleteQuestion }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`pb-5 border-b border-slate-200 last:border-b-0 last:pb-0 ${
        isDragging ? 'z-50' : ''
      }`}
    >
      <div className="flex items-start gap-2 sm:gap-3 mb-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 transition-colors mt-1 shrink-0"
        >
          <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 mb-2 break-words">
            {question.questionText}
          </h3>
          <div className="mt-3">
            {renderQuestionInput(question, false)}
          </div>
        </div>
        <button
          onClick={() => onDeleteQuestion && onDeleteQuestion(question.id)}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Delete question"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Unified API: readOnly → QuestionContent, else → SortableQuestionPreview
function QuestionPreview({ question, onDeleteQuestion, readOnly = false, value, onChange }) {
  if (readOnly) {
    return <QuestionContent question={question} value={value} onChange={onChange} />;
  }
  return <SortableQuestionPreview question={question} onDeleteQuestion={onDeleteQuestion} />;
}

export default QuestionPreview;
