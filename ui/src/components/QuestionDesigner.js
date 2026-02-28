import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

function QuestionDesigner({ onAddQuestion }) {
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([]);
  const [currentOption, setCurrentOption] = useState('');

  const questionTypes = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'checkbox', label: 'Checkbox List' },
    { value: 'short-text', label: 'Short Text' },
    { value: 'long-text', label: 'Long Text' }
  ];

  const needsOptions = questionType === 'multiple-choice' || questionType === 'checkbox';

  const handleAddOption = () => {
    if (currentOption.trim()) {
      setOptions([...options, currentOption.trim()]);
      setCurrentOption('');
    }
  };

  const handleRemoveOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleAddQuestion = () => {
    if (!questionText.trim()) {
      alert('Please enter a question');
      return;
    }

    if (needsOptions && options.length === 0) {
      alert('Please add at least one option');
      return;
    }

    const questionData = {
      type: questionType,
      questionText: questionText.trim(),
      options: needsOptions ? options : []
    };

    onAddQuestion(questionData);

    setQuestionText('');
    setOptions([]);
    setCurrentOption('');
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 text-left lg:sticky lg:top-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-5 pb-3 border-b border-slate-200">
        Question Designer
      </h2>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Question Type
          </label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors"
          >
            {questionTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Question Text
          </label>
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter question text"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors"
          />
        </div>

        {needsOptions && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Answer Options
            </label>
            
            {options.length > 0 && (
              <div className="space-y-2 mb-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 border border-slate-200 rounded-md bg-slate-50 text-slate-700 text-sm">
                      {option}
                    </div>
                    <button
                      onClick={() => handleRemoveOption(index)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Remove option"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={currentOption}
                onChange={(e) => setCurrentOption(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                placeholder="Add an option"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors"
              />
              <button
                onClick={handleAddOption}
                className="p-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 border border-slate-200 transition-colors"
                title="Add option"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleAddQuestion}
          className="w-full px-4 py-3 bg-slate-800 text-white font-medium rounded-md hover:bg-slate-900 border border-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Question
        </button>
      </div>
    </div>
  );
}

export default QuestionDesigner;