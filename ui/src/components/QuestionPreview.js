import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus, X } from 'lucide-react';

function renderQuestionInput(question, readOnly, value, onChange) {
  const options = Array.isArray(question.options) ? question.options : [];
  switch (question.type) {
    case 'multiple-choice':
      return (
        <div className="space-y-2">
          {options.map((option, idx) => (
            <label key={`${question.id}-opt-${idx}`} className="flex items-center gap-2 cursor-pointer">
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
            <label key={`${question.id}-opt-${idx}`} className="flex items-center gap-2 cursor-pointer">
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
    case 'numeric':
      return (
        <input
          type="number"
          placeholder="Enter a number"
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-left text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 text-sm"
          value={readOnly ? (value ?? '') : ''}
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
            {question.questionText}{question.required && <span className="text-red-500 ml-0.5">*</span>}
          </h3>
          <div className="mt-3">
            {renderQuestionInput(question, true, value, onChange)}
          </div>
        </div>
      </div>
    </div>
  );
}

// Editable options for choice types (builder mode)
function EditableOptions({ question, onUpdate }) {
  const options = Array.isArray(question.options) ? question.options : [];
  const needsOptions = question.type === 'multiple-choice' || question.type === 'checkbox';

  if (!needsOptions) return null;

  const updateOption = (idx, value) => {
    const next = [...options];
    next[idx] = value;
    onUpdate({ options: next });
  };
  const removeOption = (idx) => {
    const next = options.filter((_, i) => i !== idx);
    onUpdate({ options: next });
  };
  const addOption = () => {
    onUpdate({ options: [...options, ''] });
  };

  return (
    <div className="space-y-2 mt-2">
      {options.map((opt, idx) => (
        <div key={`${question.id}-opt-${idx}`} className="flex items-center gap-2">
          <input
            type="text"
            value={opt}
            onChange={(e) => updateOption(idx, e.target.value)}
            placeholder={`Option ${idx + 1}`}
            aria-label={`Option ${idx + 1}`}
            className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
          />
          <button
            type="button"
            onClick={() => removeOption(idx)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Remove option"
            aria-label={`Remove option ${idx + 1}`}
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addOption}
        className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-medium"
        aria-label="Add option"
      >
        <Plus className="w-4 h-4" aria-hidden /> Add option
      </button>
    </div>
  );
}

// Builder mode: draggable with delete and edit (only used inside DndContext in SurveyPreview)
function SortableQuestionPreview({ question, onDeleteQuestion, onUpdateQuestion }) {
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

  const handleUpdate = (updates) => {
    if (onUpdateQuestion) onUpdateQuestion(question.id, updates);
  };

  const needsOptions = question.type === 'multiple-choice' || question.type === 'checkbox';

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
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />
        </button>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={question.questionText || ''}
            onChange={(e) => handleUpdate({ questionText: e.target.value })}
            placeholder="Question text"
            aria-label="Question text"
            className="w-full text-sm font-semibold text-slate-900 mb-2 px-2 py-1 border border-slate-200 rounded focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id={`req-${question.id}`}
              checked={!!question.required}
              onChange={(e) => handleUpdate({ required: e.target.checked })}
              className="w-4 h-4 text-teal-600 rounded border-slate-300"
            />
            <label htmlFor={`req-${question.id}`} className="text-xs text-slate-500">Required</label>
          </div>
          {needsOptions ? (
            <EditableOptions question={question} onUpdate={handleUpdate} />
          ) : (
            <div className="mt-2 text-slate-400 text-sm italic">
              {question.type === 'short-text' && 'Short text answer'}
              {question.type === 'long-text' && 'Long text answer'}
              {question.type === 'numeric' && 'Numeric answer'}
            </div>
          )}
        </div>
        <button
          onClick={() => onDeleteQuestion && onDeleteQuestion(question.id)}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Delete question"
          aria-label="Delete question"
        >
          <Trash2 className="w-5 h-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

// Unified API: readOnly → QuestionContent, else → SortableQuestionPreview
function QuestionPreview({ question, onDeleteQuestion, onUpdateQuestion, readOnly = false, value, onChange }) {
  if (readOnly) {
    return <QuestionContent question={question} value={value} onChange={onChange} />;
  }
  return <SortableQuestionPreview question={question} onDeleteQuestion={onDeleteQuestion} onUpdateQuestion={onUpdateQuestion} />;
}

export default QuestionPreview;
