import { memo } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TaskCard = ({ task, taskIndex, columnIndex, taskVariants, onTaskClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.taskId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 0.2s ease',
    opacity: isDragging ? 0.7 : 1,
    boxShadow: isDragging ? '0 4px 8px rgba(0, 0, 0, 0.2)' : 'none',
    transformOrigin: 'center',
    rotate: isDragging ? '3deg' : '0deg',
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-bg-card p-2 rounded-lg text-text-primary cursor-pointer hover:border-2 hover:border-accent-primary touch-none"
      variants={taskVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={taskIndex}
      transition={{ duration: 0.3, delay: (columnIndex + 1) * 0.3 + taskIndex * 0.1 }}
      onClick={() => onTaskClick(task)}
      role="button"
      aria-label={`View or drag task ${task.taskName}`}
    >
      <p className="font-medium">{task.taskName}</p>
      <p className="text-sm text-text-secondary">ID: {task.taskId}</p>
    </motion.div>
  );
};

export default memo(TaskCard);