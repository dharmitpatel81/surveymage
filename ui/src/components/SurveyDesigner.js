import React, { useState, useRef } from 'react';
import QuestionDesigner from './QuestionDesigner';
import SurveyPreview from './SurveyPreview';

function SurveyDesigner() {
  const [questions, setQuestions] = useState([]);
  const previewRef = useRef(null);

  const handleAddQuestion = (questionData) => {
    const newQuestion = {
      ...questionData,
      id: Date.now()
    };
    setQuestions([...questions, newQuestion]);
    
    setTimeout(() => {
      if (previewRef.current) {
        previewRef.current.scrollTo({
          top: previewRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleDeleteQuestion = (questionId) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleReorderQuestions = (newQuestions) => {
    setQuestions(newQuestions);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6">
          <div className="w-1/3">
            <QuestionDesigner onAddQuestion={handleAddQuestion} />
          </div>
          <div className="w-2/3">
            <SurveyPreview 
              questions={questions} 
              onDeleteQuestion={handleDeleteQuestion}
              onReorderQuestions={handleReorderQuestions}
              previewRef={previewRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SurveyDesigner;