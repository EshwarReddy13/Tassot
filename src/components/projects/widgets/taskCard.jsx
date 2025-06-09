import { memo } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TaskCard = ({ task, onTaskClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id }); // Use the UUID for dnd-kit

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 0.2s ease',
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 100 : 'auto',
    boxShadow: isDragging ? '0 0.5rem 1rem rgba(0, 0, 0, 0.3)' : 'none',
    transformOrigin: 'center',
    rotate: isDragging ? '3deg' : '0deg',
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layoutId={task.id}
      className="bg-bg-card p-3 rounded-lg text-text-primary cursor-pointer border-2 border-transparent hover:border-accent-primary focus-visible:border-accent-primary touch-none"
      variants={cardVariants}
      onClick={() => onTaskClick(task)}
      role="button"
      aria-label={`View or drag task ${task.task_name}`}
    >
      <p className="font-medium text-text-primary mb-2 break-words" style={{ fontSize:'clamp(0.9rem, 2vw, 1rem)'}}>
        {task.task_name}
      </p>
      <span className="text-xs font-semibold text-text-secondary bg-bg-secondary px-2 py-1 rounded-md">
        {task.task_key}
      </span>
    </motion.div>
  );
};

export default memo(TaskCard);