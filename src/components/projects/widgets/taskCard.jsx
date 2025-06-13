import { memo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { HiPencil, HiTrash } from 'react-icons/hi';

const TaskCard = ({ task, onTaskClick, isOverlay = false, isGlobalDragging = false, onDelete, onUpdateName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [taskName, setTaskName] = useState(task.task_name);
  const inputRef = useRef(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isThisCardDragging } = useSortable({
    id: task.id,
    data: { task },
    disabled: isGlobalDragging || isEditing,
  });

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 0.2s ease',
    opacity: isThisCardDragging && !isOverlay ? 0.5 : 1,
    zIndex: isOverlay ? 100 : 'auto',
    boxShadow: isOverlay ? '0 1rem 1.5rem rgba(0, 0, 0, 0.3)' : 'none',
    rotate: isOverlay ? '5deg' : '0deg',
  };

  const handleCardClick = (e) => {
    if (isThisCardDragging || isEditing) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onTaskClick(task);
  };

  const handleSave = () => {
    if (taskName.trim() && taskName.trim() !== task.task_name) {
      onUpdateName(task.id, taskName.trim());
    } else {
      setTaskName(task.task_name);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setTaskName(task.task_name);
      setIsEditing(false);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(task.id);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group">
      <motion.div
        layoutId={task.id}
        className={clsx(
          'p-3 rounded-lg touch-none transition-all duration-200',
          {
            'bg-bg-card text-text-primary cursor-pointer border-2 border-transparent hover:border-accent-primary focus-visible:border-accent-primary': !isThisCardDragging && !isEditing,
            'bg-bg-card ring-2 ring-accent-primary': isEditing,
            'bg-transparent border-2 border-dashed border-accent-primary/60 h-[5.25rem]': isThisCardDragging && !isOverlay,
            'invisible': isThisCardDragging && !isOverlay,
          }
        )}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isEditing) handleCardClick(e);
        }}
        role="button"
        tabIndex={isEditing ? -1 : 0}
        aria-label={`View or drag task ${task.task_name}`}
      >
        {(!isThisCardDragging || isOverlay) && (
          <>
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-text-primary font-medium outline-none p-0 m-0 border-none"
                style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}
                aria-label="Edit task name"
              />
            ) : (
              <p className="font-medium text-text-primary mb-2 break-words" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
                {task.task_name}
              </p>
            )}
            <span className="text-xs font-semibold text-text-secondary bg-bg-secondary px-2 py-1 rounded-md">
              {task.task_key}
            </span>
          </>
        )}
      </motion.div>

      {/* --- THIS IS THE FIX --- */}
      {/* The `canModify` check is removed. Icons are rendered if not in editing mode. */}
      { !isEditing && (
        <div 
            className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-hidden="true" 
        >
          <button
            onClick={handleEditClick}
            className="p-1 rounded-md text-text-secondary hover:bg-bg-primary hover:text-white"
            aria-label={`Edit task name for ${task.task_name}`}
          >
            <HiPencil className="w-4 h-4" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-1 rounded-md text-red-400 hover:bg-red-900/50 hover:text-red-300"
            aria-label={`Delete task ${task.task_name}`}
          >
            <HiTrash className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(TaskCard);