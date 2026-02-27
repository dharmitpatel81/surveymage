import React from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import QuestionPreview from './QuestionPreview';

function SurveyPreview({ questions, onDeleteQuestion, onReorderQuestions, previewRef }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      
      const newQuestions = arrayMove(questions, oldIndex, newIndex);
      onReorderQuestions(newQuestions);
    }
  };

  return (
    <div ref={previewRef} className="bg-white rounded-lg shadow-md p-6 text-left max-h-[calc(100vh-200px)] overflow-y-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Survey Preview</h2>

      {questions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No questions added yet</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map(q => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {questions.map((question) => (
                <QuestionPreview
                  key={question.id}
                  question={question}
                  onDeleteQuestion={onDeleteQuestion}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

export default SurveyPreview;