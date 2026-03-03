import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import WidgetPreview from './WidgetPreview';
import { useDnDSensors } from '../hooks/useDnDSensors';

function DashboardView({ surveyTitle, widgets = [], questions = [], responses = [], onDeleteWidget, onReorderWidgets, previewRef }) {
  const sensors = useDnDSensors();

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);

      const newWidgets = arrayMove(widgets, oldIndex, newIndex);
      onReorderWidgets(newWidgets);
    }
  };

  const getQuestionById = (id) =>
    questions.find((q) => String(q.id) === String(id));

  return (
    <div
      ref={previewRef}
      className="flex flex-col min-w-0 overflow-auto"
    >
      <div className="px-6 pt-6 pb-2 shrink-0">
        <h2 className="text-base font-semibold text-slate-500 uppercase tracking-wider">Dashboard Preview</h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Analyzing: <span className="text-slate-600 font-medium">{surveyTitle}</span>
        </p>
      </div>

      <div className="flex-1 p-6 pt-4 min-h-[320px]">
      {widgets.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-xl py-20 px-8 text-center bg-white/80 shadow-inner">
          <p className="text-slate-500 font-medium">No widgets added yet.</p>
          <p className="text-slate-400 text-sm mt-1">Use the Widget Designer on the left to add charts and visualizations.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={widgets.map((w) => w.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full auto-rows-min pb-6">
              {widgets.map((widget) => (
                <WidgetPreview
                  key={widget.id}
                  widget={widget}
                  question={getQuestionById(widget.questionId)}
                  responses={responses}
                  onDeleteWidget={onDeleteWidget}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      </div>
    </div>
  );
}

export default DashboardView;
