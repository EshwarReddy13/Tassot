import { memo } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';

const TaskCard = ({ task, onTaskClick, isOverlay = false, isGlobalDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isThisCardDragging,
  } = useSortable({ 
    id: task.id, 
    data: { task },
    // THE FIX: Disable sorting on this item if any other item is being dragged.
    // This makes the column the only valid drop target.
    disabled: isGlobalDragging,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 0.2s ease',
    opacity: isThisCardDragging ? 1 : 1,
    zIndex: isOverlay ? 100 : 'auto',
    boxShadow: isOverlay ? '0 1rem 1.5rem rgba(0, 0, 0, 0.3)' : 'none',
    rotate: isOverlay ? '5deg' : '0deg',
  };

  const handleCardClick = (e) => {
    if (isThisCardDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onTaskClick(task);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <motion.div
        layoutId={task.id}
        className={clsx(
          'p-3 rounded-lg touch-none transition-colors duration-200',
          {
            'bg-bg-card text-text-primary cursor-pointer border-2 border-transparent hover:border-accent-primary focus-visible:border-accent-primary': !isThisCardDragging,
            'bg-transparent border-2 border-dashed border-accent-primary/60 h-[5.25rem]': isThisCardDragging && !isOverlay,
          }
        )}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleCardClick(e);
        }}
        role="button"
        tabIndex={0}
        aria-label={`View or drag task ${task.task_name}`}
      >
        {(!isThisCardDragging || isOverlay) && (
          <>
            <p className="font-medium text-text-primary mb-2 break-words" style={{ fontSize:'clamp(0.9rem, 2vw, 1rem)'}}>
              {task.task_name}
            </p>
            <span className="text-xs font-semibold text-text-secondary bg-bg-secondary px-2 py-1 rounded-md">
              {task.task_key}
            </span>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default memo(TaskCard);