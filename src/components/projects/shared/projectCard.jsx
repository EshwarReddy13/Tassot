import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import PinButton from './PinButton.jsx';

const ProjectCard = ({ 
  project, 
  index, 
  onEdit, 
  onDelete, 
  onPinToggle, 
  onNavigate,
  isPinning = false,
  isDragging = false,
  isGlobalDragging = false
}) => {
  const handleCardClick = () => {
    if (!isDragging && !isGlobalDragging) {
      onNavigate(`/projects/${project.projectUrl ?? project.project_url}`);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(project);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(project);
  };

  const handlePinToggle = () => {
    onPinToggle(project.projectUrl ?? project.project_url);
  };

  return (
    <motion.div 
      className={`relative bg-bg-card rounded-lg p-4 group transition-all duration-300 ${
        project.isPinned 
          ? 'ring-2 ring-accent-primary/50 bg-bg-card/90' 
          : 'hover:bg-bg-card/80'
      }`}
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      transition={{ delay: index * 0.05 }}
      layout
      style={{
        cursor: isDragging ? 'grabbing' : 'pointer',
        zIndex: isDragging ? 1000 : 'auto',
      }}
      whileHover={!isDragging && !isGlobalDragging ? { 
        scale: 1.02, 
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        transition: { duration: 0.2 }
      } : {}}
    >
      {/* Pin indicator for pinned projects */}
      {project.isPinned && (
        <motion.div 
          className="absolute -top-2 -left-2 z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-accent-primary text-text-primary text-xs px-2 py-1 rounded-full font-medium">
            📌 Pinned
          </div>
        </motion.div>
      )}

      {/* Main content */}
      <div className="cursor-pointer" onClick={handleCardClick}>
        <div className="flex items-start justify-between mb-2">
          <p className={`text-xl font-semibold mb-2 truncate group-hover:text-accent-primary transition-colors ${
            project.isPinned ? 'text-accent-primary' : 'text-text-primary'
          }`} title={project.projectName ?? project.project_name}>
            {project.projectName ?? project.project_name}
          </p>
        </div>
        
        <p className="text-text-secondary text-sm font-mono mb-2">
          KEY: {project.projectKey ?? project.project_key}
        </p>
        
        <p className="text-text-tertiary text-sm">
          Created: {new Date(project.createdAt ?? project.created_at).toLocaleDateString()}
        </p>
      </div>
      
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex space-x-1">
        <PinButton
          isPinned={project.isPinned}
          onPinToggle={handlePinToggle}
          disabled={isPinning}
          className="z-20"
        />
        
        <button 
          onClick={handleEditClick} 
          aria-label="Edit project"
          className="p-2 rounded-full text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 transition-colors"
        >
          <HiOutlinePencil className="w-4 h-4" />
        </button>
        
        <button 
          onClick={handleDeleteClick} 
          aria-label="Delete project"
          className="p-2 rounded-full text-text-secondary hover:text-error hover:bg-error/10 transition-colors"
        >
          <HiOutlineTrash className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default ProjectCard; 