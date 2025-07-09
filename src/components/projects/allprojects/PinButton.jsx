import React from 'react';
import { motion } from 'framer-motion';

const FilledBookmarkIcon = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-4 h-4 ${className}`}
    aria-hidden="true"
  >
    <path d="M6 2a2 2 0 0 0-2 2v18a1 1 0 0 0 1.447.894L12 19.118l6.553 3.776A1 1 0 0 0 20 22V4a2 2 0 0 0-2-2H6z" />
  </svg>
);

const PinButton = ({ isPinned, onPinToggle, disabled = false, className = '' }) => {
  const handleClick = (e) => {
    e.stopPropagation(); // Prevent triggering parent click events
    if (!disabled) {
      onPinToggle();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary ${
        isPinned 
          ? 'text-accent-primary bg-accent-primary/10 hover:bg-accent-primary/20' 
          : 'text-accent-primary/70 hover:text-accent-primary hover:bg-accent-primary/10'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      aria-label={isPinned ? 'Remove bookmark' : 'Bookmark project'}
      title={isPinned ? 'Remove bookmark' : 'Bookmark project'}
    >
      <motion.div
        animate={{ rotate: 0 }}
        transition={{ duration: 0.2 }}
      >
        <FilledBookmarkIcon className={isPinned ? '' : 'opacity-40'} />
      </motion.div>
    </motion.button>
  );
};

export default PinButton; 