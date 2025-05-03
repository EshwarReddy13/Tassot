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
    transition: transition || 'transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease',
    opacity: isDragging ? 0.6 : 1,
    boxShadow: isDragging ? '0 8px 16px rgba(0, 0, 0, 0.3)' : 'none',
    transformOrigin: 'center',
    scale: isDragging ? 1.1 : 1, // Pop-out effect
    rotate: isDragging ? '5deg' : '0deg', // Stronger rotation
    zIndex: isDragging ? 1000 : 'auto', // Ensure card is above other elements
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-bg-card p-3 rounded-lg text-text-primary cursor-grab touch-none border border-border hover:border-accent-primary"
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
      <p className="font-medium text-sm">{task.taskName}</p>
      <p className="text-xs text-text-secondary mt-1">ID: {task.taskId}</p>
    </motion.div>
  );
};

export default memo(TaskCard);