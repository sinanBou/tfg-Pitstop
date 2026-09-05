import React from 'react';
import type { CatalogTask } from '../TasksTab';
import { Edit, Trash } from '@/assets/icons';
import { useTranslation } from '@/i18n';
import { formatHours } from '@/utils/formatters';

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
  const { t } = useTranslation();

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
          {task.hours !== undefined && task.hours !== null && `${formatHours(task.hours)} (${t('tasksTab.fixedHours')})`}
          {task.hours4Cil !== undefined && task.hours4Cil !== null && `${formatHours(task.hours4Cil)} (${t('tasksTab.baseHours')}) ${task.hoursCilExtra ? `+ ${formatHours(task.hoursCilExtra)}${t('tasksTab.perCil')}` : ''}`}
          {task.hours1Rueda !== undefined && task.hours1Rueda !== null && `${formatHours(task.hours1Rueda)} (${t('tasksTab.perWheel')})`}
        </div>

        {/* Edit Action Button */}
        <button
          onClick={onStartEdit}
          className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800/40 rounded-xl transition-all cursor-pointer"
          title={t('tasksTab.editTaskTitle')}
        >
          <Edit className="w-4 h-4" />
        </button>

        {/* Delete Action Button */}
        <button
          onClick={onDelete}
          className="p-2 text-neutral-600 hover:text-red-500 hover:bg-neutral-800/40 rounded-xl transition-all cursor-pointer"
          title={t('tasksTab.deleteTaskTitle')}
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
