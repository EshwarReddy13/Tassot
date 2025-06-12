import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './taskCard.jsx';
import clsx from 'clsx';

const KanbanColumn = memo(({ column, children, tasks, onTaskClick, isDragging }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <motion.div
      ref={setNodeRef}
      className={clsx(
        'bg-bg-secondary rounded-xl p-4 flex flex-col min-h-[25rem] transition-all duration-300',
        { 'gradient-border': isOver }
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="region"
      aria-label={`${column.name} column`}
    >
      <div className={clsx("flex justify-between items-center mb-4", { 'pointer-events-none': isDragging })}>
        <h3 className="text-white font-semibold" style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>
          {column.name}
        </h3>
        <span className="text-sm font-medium text-text-secondary bg-bg-primary px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-grow space-y-3 overflow-y-auto pr-1">
          <AnimatePresence>
            {tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onTaskClick={onTaskClick} 
                isGlobalDragging={isDragging} 
              />
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
      {children}
    </motion.div>
  );
});

export default KanbanColumn;