import React from 'react';
import { motion } from 'framer-motion';
import { FiMapPin } from 'react-icons/fi';

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
          : 'text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      aria-label={isPinned ? 'Unpin project' : 'Pin project'}
      title={isPinned ? 'Unpin project' : 'Pin project'}
    >
      <motion.div
        animate={{ rotate: isPinned ? 0 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <FiMapPin 
          className={`w-4 h-4 transition-transform duration-200 ${
            isPinned ? 'rotate-0' : 'rotate-45'
          }`} 
        />
      </motion.div>
    </motion.button>
  );
};

export default PinButton; 