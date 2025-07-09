import { motion } from 'framer-motion';
import { useState } from 'react';

const ProjectCard = ({ project, onNavigate }) => (
  <motion.div
    className="glass-dark rounded-xl p-4 cursor-pointer group"
    whileHover={{ y: -2 }}
    onClick={() => onNavigate(`/projects/${project.projectUrl || project.project_url}`)}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h3 className="text-text-primary font-semibold text-lg mb-1 group-hover:text-accent-primary transition-colors">
          {project.project_name || project.projectName}
        </h3>
        <p className="text-text-secondary text-sm font-mono">
          {project.project_key || project.projectKey}
        </p>
      </div>
      <div className="flex items-center gap-1 text-text-tertiary text-xs">
        <img 
          src="https://api.iconify.design/mdi:users.svg?color=currentColor" 
          alt="" 
          className="w-4 h-4" 
        />
        <span>{project.memberCount || 1}</span>
      </div>
    </div>
    
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-text-secondary text-sm">
          {project.project_key || project.projectKey}
        </span>
      </div>
      <span className="text-text-tertiary text-xs">
        {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'No date'}
      </span>
    </div>
  </motion.div>
);

const PinnedProjects = ({ projects, onCreateProject, onNavigate }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pinnedProjects = projects?.filter(p => p.isPinned) || [];

  const handleCreateProject = () => {
    if (onCreateProject) {
      onCreateProject();
    } else {
      setIsDrawerOpen(true);
    }
  };

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl align-middle mr-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-accent-primary inline-block align-middle">
              <path d="M6 2a2 2 0 0 0-2 2v18a1 1 0 0 0 1.447.894L12 19.118l6.553 3.776A1 1 0 0 0 20 22V4a2 2 0 0 0-2-2H6z" />
            </svg>
          </span>
          <h2 className="text-text-primary text-xl font-bold">Bookmarked Projects</h2>
          {pinnedProjects.length > 0 && (
            <span className="bg-accent-primary/20 text-accent-primary text-xs px-2 py-1 rounded-full font-medium">
              {pinnedProjects.length}
            </span>
          )}
        </div>
        <motion.button
          className="bg-accent-primary hover:bg-accent-hover text-text-inverse px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateProject}
        >
          <img 
            src="https://api.iconify.design/mdi:plus.svg?color=white" 
            alt="" 
            className="w-4 h-4" 
          />
          Create Project
        </motion.button>
      </div>

      {pinnedProjects.length === 0 ? (
        <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
          <div className="text-text-tertiary mb-4 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-accent-primary">
              <path d="M6 2a2 2 0 0 0-2 2v18a1 1 0 0 0 1.447.894L12 19.118l6.553 3.776A1 1 0 0 0 20 22V4a2 2 0 0 0-2-2H6z" />
            </svg>
          </div>
          <p className="text-text-secondary mb-2">No bookmarked projects yet</p>
          <p className="text-text-tertiary text-sm">Bookmark your favorite projects to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {pinnedProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProjectCard project={project} onNavigate={onNavigate} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PinnedProjects; 