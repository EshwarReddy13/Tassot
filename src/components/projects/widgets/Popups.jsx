import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';

export const AddColumnForm = ({
  isAdding,
  name,
  error,
  onAddColumnClick,
  onColumnNameChange,
  onAddColumn,
  onCancelAddColumn,
  inputRef,
}) => {
  const formVariants = {
    hidden: { opacity: 0, height: 0, y: -10 },
    visible: { opacity: 1, height: 'auto', y: 0, transition: { duration: 0.3 } },
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddColumn();
    }
    if (e.key === 'Escape') {
      onCancelAddColumn();
    }
  };

  if (!isAdding) {
    return (
      <motion.button
        onClick={onAddColumnClick}
        className="w-full h-full flex items-center justify-center p-4 rounded-lg text-text-secondary hover:bg-bg-card hover:text-accent-primary transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        aria-label="Add a new column"
      >
        <span className="font-semibold text-lg">+ Add New Column</span>
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="w-full"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={formVariants}
      >
        <div className="bg-bg-card p-3 rounded-lg shadow-md w-full">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={onColumnNameChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter column name..."
            className="w-full bg-bg-primary text-text-primary placeholder-text-placeholder p-2 rounded-md border-2 border-transparent focus:border-accent-primary focus:outline-none"
            aria-label="New column name"
          />
          {error && (
            <p className="text-error text-sm mt-2 px-1">{error}</p>
          )}
          <div className="flex items-center justify-start space-x-2 mt-3">
            <button
              onClick={onAddColumn}
              className="px-4 py-2 bg-accent-primary text-text-primary font-semibold rounded-md hover:bg-accent-hover transition-colors duration-200"
              aria-label="Save new column"
            >
              Save
            </button>
            <button
              onClick={onCancelAddColumn}
              className="p-2 text-text-secondary hover:text-text-primary rounded-full"
              aria-label="Cancel adding column"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// I am keeping your existing AddTaskForm code untouched as per your instructions,
// even though the new AddTaskModal has replaced its functionality.
export const AddTaskForm = ({
  taskName,
  onTaskNameChange,
  onSave,
  onCancel,
  inputRef,
  error
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <motion.div
      className="w-full mt-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-bg-card p-2 rounded-lg">
        <textarea
          ref={inputRef}
          value={taskName}
          onChange={onTaskNameChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter a title for this task..."
          className="w-full bg-bg-secondary text-text-primary placeholder-text-placeholder p-2 rounded-md border-2 border-transparent focus:border-accent-primary focus:outline-none resize-none"
          aria-label="New task name"
          rows={2}
        />
        {error && <p className="text-error text-sm mt-1 px-1">{error}</p>}
        <div className="flex items-center space-x-2 mt-2">
          <button
            onClick={onSave}
            className="px-3 py-1.5 bg-accent-primary text-text-primary text-sm font-semibold rounded-md hover:bg-accent-hover transition-colors"
            aria-label="Save new task"
          >
            Save Task
          </button>
          <button
            onClick={onCancel}
            className="p-2 text-text-secondary hover:text-text-primary rounded-full"
            aria-label="Cancel adding task"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};