import React from 'react';
import type { CatalogTask } from '../TasksTab';

interface TaskItemRowProps {
  task: CatalogTask;
  onStartEdit: () => void;
  onDelete: () => void;
}

export const TaskItemRow: React.FC<TaskItemRowProps> = ({
  task,
  onStartEdit,
  onDelete
}) => {
  return (
    <div
      className="group px-4 py-3 bg-neutral-950 border border-neutral-850 hover:border-neutral-800 rounded-2xl flex items-center justify-between gap-4 transition-all"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[10px] font-black text-neutral-500 font-mono tracking-widest uppercase shrink-0 px-2 py-1 bg-neutral-900 rounded-lg">
          {task.code}
        </span>
        <p className="text-sm font-semibold text-neutral-200 truncate">{task.name}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {/* Hours Info Badge */}
        <div className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-xl text-[10px] font-bold text-neutral-400 font-mono">
          {task.hours !== undefined && task.hours !== null && `${task.hours.toFixed(2)}h (fijas)`}
          {task.hours4Cil !== undefined && task.hours4Cil !== null && `${task.hours4Cil.toFixed(2)}h (base) ${task.hoursCilExtra ? `+ ${task.hoursCilExtra.toFixed(2)}h/cil` : ''}`}
          {task.hours1Rueda !== undefined && task.hours1Rueda !== null && `${task.hours1Rueda.toFixed(2)}h (por rueda)`}
        </div>

        {/* Edit Action Button */}
        <button
          onClick={onStartEdit}
          className="p-2 text-neutral-500 hover:text-blue-400 hover:bg-neutral-800/40 rounded-xl transition-all cursor-pointer"
          title="Editar Tarea"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>

        {/* Delete Action Button */}
        <button
          onClick={onDelete}
          className="p-2 text-neutral-600 hover:text-red-500 hover:bg-neutral-800/40 rounded-xl transition-all cursor-pointer"
          title="Eliminar Tarea"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};
