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
    <div className="bg-white rounded-lg shadow-md p-6 text-left sticky top-6 border border-primary-100">
      <h2 className="text-xl font-bold text-primary-900 mb-6">Question Designer</h2>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-primary-900 mb-2">
            Question Type
          </label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="w-full px-3 py-2 border border-primary-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          >
            {questionTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-900 mb-2">
            Question Text
          </label>
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter question text"
            className="w-full px-3 py-2 border border-primary-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>

        {needsOptions && (
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-2">
              Answer Options
            </label>
            
            {options.length > 0 && (
              <div className="space-y-2 mb-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 border border-primary-100 rounded-lg bg-primary-50 text-gray-700 text-sm">
                      {option}
                    </div>
                    <button
                      onClick={() => handleRemoveOption(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
                className="flex-1 px-3 py-2 border border-primary-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
              <button
                onClick={handleAddOption}
                className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm font-medium"
              >
                Add
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleAddQuestion}
          className="w-full px-4 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add Question
        </button>
      </div>
    </div>
  );
}

export default QuestionDesigner;