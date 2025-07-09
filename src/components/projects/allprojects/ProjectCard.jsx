import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineFolder } from 'react-icons/hi';
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
  // Debug statements for members
  console.log('ProjectCard Debug:', {
    projectName: project.projectName ?? project.project_name,
    members: project.members,
    membersCount: project.members?.length || 0,
    membersData: project.members ? project.members.map(m => ({ 
      id: m.id, 
      name: `${m.first_name} ${m.last_name}`, 
      role: m.role 
    })) : 'No members array'
  });

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

  // Helper function to render member avatars
  const renderMembers = () => {
    const members = project.members || [];
    if (members.length === 0) {
      console.log('No members to display for project:', project.projectName ?? project.project_name);
      return null;
    }

    const maxVisible = 3;
    const visibleMembers = members.slice(0, maxVisible);
    const hiddenCount = Math.max(0, members.length - maxVisible);

    return (
      <div className="flex items-center -space-x-2">
        {visibleMembers.map((member, idx) => {
          const initials = `${member.first_name?.[0] || '?'}${member.last_name?.[0] || ''}`.toUpperCase();
          return (
            <div
              key={member.id || idx}
              className="w-6 h-6 rounded-full bg-bg-secondary border-2 border-bg-dark flex items-center justify-center overflow-hidden"
              title={`${member.first_name || 'Unknown'} ${member.last_name || ''} (${member.role || 'user'})`}
            >
              {member.photo_url ? (
                <img
                  src={member.photo_url}
                  alt={`${member.first_name} ${member.last_name}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-[10px] font-semibold text-text-primary">
                  {initials}
                </span>
              )}
            </div>
          );
        })}
        {hiddenCount > 0 && (
          <div className="w-6 h-6 rounded-full bg-bg-tertiary border-2 border-bg-dark flex items-center justify-center">
            <span className="text-[10px] font-semibold text-text-secondary">
              +{hiddenCount}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div 
      className={`relative group transition-all duration-300 ${
        project.isPinned 
          ? 'bookmarked-card' 
          : 'glass-card glass-hover'
      }`}
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      transition={{ delay: index * 0.05 }}
      layout
      style={{
        cursor: isDragging ? 'grabbing' : 'pointer',
        zIndex: isDragging ? 1000 : 'auto',
        height: '150px', // Fixed height for consistency
      }}
      whileHover={!isDragging && !isGlobalDragging ? { 
        scale: 1.02, 
        transition: { duration: 0.2 }
      } : {}}
    >
      {/* Simple pin indicator for pinned projects */}
      {project.isPinned && (
        <motion.div 
          className="absolute -top-4 -left-4 z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-4xl">
            {/* Filled bookmark icon for bookmarked projects */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-accent-primary">
              <path d="M6 2a2 2 0 0 0-2 2v18a1 1 0 0 0 1.447.894L12 19.118l6.553 3.776A1 1 0 0 0 20 22V4a2 2 0 0 0-2-2H6z" />
            </svg>
          </div>
        </motion.div>
      )}

      {/* Main content */}
      <div className="cursor-pointer p-5 h-full flex flex-col" onClick={handleCardClick}>
        {/* Project Title with Folder Icon */}
        <div className="flex items-center mb-3">
          <HiOutlineFolder className="w-5 h-5 mr-2 text-accent-primary flex-shrink-0" />
          <h3 className={`text-lg font-semibold truncate group-hover:text-accent-primary transition-colors ${
            project.isPinned ? 'text-accent-primary' : 'text-text-primary'
          }`} title={project.projectName ?? project.project_name}>
            {project.projectName ?? project.project_name}
          </h3>
        </div>
        
        {/* Project Key */}
        <div className="flex items-center mb-3">
          <span className="text-text-secondary text-sm mr-2">KEY:</span>
          <span className="text-accent-primary font-semibold text-sm font-mono bg-accent-primary/10 px-2 py-1 rounded">
            {project.projectKey ?? project.project_key}
          </span>
        </div>
        
        {/* Updated Date and Members - Same Line */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center text-text-tertiary text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Updated at: {new Date(project.updatedAt ?? project.updated_at ?? project.createdAt ?? project.created_at).toLocaleDateString()}
          </div>
          {renderMembers()}
        </div>
      </div>
      
      {/* Action buttons with colors */}
      <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
        <PinButton
          isPinned={project.isPinned}
          onPinToggle={handlePinToggle}
          disabled={isPinning}
          className="z-20"
        />
        
        <button 
          onClick={handleEditClick} 
          aria-label="Edit project"
          className="p-2 rounded-full transition-colors"
        >
          <HiOutlinePencil className="w-4 h-4" />
        </button>
        
        <button 
          onClick={handleDeleteClick} 
          aria-label="Delete project"
          className="p-2 rounded-full text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <HiOutlineTrash className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default ProjectCard; 