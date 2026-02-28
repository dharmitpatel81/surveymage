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
    <div ref={previewRef} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 text-left min-w-0">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-5 pb-3 border-b border-slate-200">
        Survey Preview
      </h2>

      {questions.length === 0 ? (
        <div className="text-center py-12 sm:py-16 text-slate-400 text-sm">
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