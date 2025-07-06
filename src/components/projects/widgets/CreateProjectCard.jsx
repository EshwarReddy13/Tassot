import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlus } from 'react-icons/hi';

const CreateProjectCard = ({ onClick, index = 0 }) => {
  console.log('CreateProjectCard: Rendering with dotted border');
  
  return (
    <motion.div 
      className="relative glass-card glass-hover group transition-all duration-300 cursor-pointer"
      style={{
        height: '150px', // Fixed height to match ProjectCard exactly
        border: '3px dotted var(--color-gray-500)', // Use accent-primary color
      }}
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: index * 0.05 }}
      whileHover={{ 
        scale: 1.02, 
        transition: { duration: 0.2 }
      }}
      onClick={onClick}
    >
      {/* Main content */}
      <div className="flex flex-col items-center justify-center h-full p-5">
        <motion.div 
          className="w-12 h-12 rounded-full glass-secondary flex items-center justify-center mb-3 group-hover:bg-accent-primary/20 transition-colors border border-accent-primary/30"
          whileHover={{ scale: 1.1 }}
        >
          <HiOutlinePlus className="w-6 h-6 text-accent-primary" />
        </motion.div>
        
        <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent-primary transition-colors mb-2">
          Create New Project
        </h3>
        
        <p className="text-text-secondary text-sm leading-relaxed text-center">
          Start organizing your tasks
        </p>
      </div>
    </motion.div>
  );
};

export default CreateProjectCard; 