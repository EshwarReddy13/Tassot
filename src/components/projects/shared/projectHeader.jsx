import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useProjects } from '../../../contexts/ProjectContext';
import { useUser } from '../../../contexts/UserContext';
import ProjectMembers from './projectMembers.jsx';
import InviteModal from '../modals/inviteModal.jsx';

const SearchIcon = (props) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ProjectHeader = () => {
  const { currentProject } = useProjects();
  const { userData } = useUser();
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);

  // --- FIX: Check permissions based on role ---
  const [currentUserRole, setCurrentUserRole] = useState(null);

  useEffect(() => {
    if (currentProject && userData) {
      const currentUser = currentProject.members?.find(m => m.id === userData.id);
      setCurrentUserRole(currentUser?.role);
    }
  }, [currentProject, userData]);

  const canInvite = currentUserRole === 'owner' || currentUserRole === 'editor';

  // No change to this handler, but the UI it controls is now role-aware
  const handleInviteClick = () => {
    setInviteModalOpen(true);
  };
  
  // Guard clause to prevent rendering with incomplete data
  if (!currentProject || !userData) {
      return (
          // Render a placeholder or nothing to prevent crashes
          <header className="fixed top-0 left-[17rem] right-0 z-10 flex h-[4rem] items-center justify-between border-b border-b-bg-secondary bg-bg-primary px-6 animate-pulse">
             <div className="h-6 w-1/4 bg-bg-secondary rounded"></div>
             <div className="h-9 w-1/3 bg-bg-secondary rounded-full"></div>
          </header>
      )
  }

  return (
    <>
      <header className="fixed top-0 left-[17rem] right-0 z-10 flex h-[4rem] items-center justify-between border-b border-b-bg-secondary bg-bg-primary px-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 'clamp(1.125rem, 1.5vw, 1.25rem)' }}>
            {currentProject.project.project_name}
          </h1>
        </motion.div>
        <motion.div className="flex items-center gap-x-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <ProjectMembers 
            // The `members` prop is still passed, ProjectMembers component handles its own logic now
            members={currentProject.members} 
            onInviteClick={handleInviteClick}
          />
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-placeholder" />
            <input type="search" className="w-48 rounded-md border-transparent bg-bg-secondary py-1.5 pl-9 pr-3 text-sm text-text-primary placeholder-text-placeholder transition-all duration-300 focus:w-56 focus:outline-none focus:ring-2 focus:ring-accent-primary" placeholder="Search tasks..." aria-label="Search tasks in this project" />
          </div>
        </motion.div>
      </header>
      
      {/* Show invite modal only if user has permissions */}
      {canInvite && (
        <InviteModal 
            isOpen={isInviteModalOpen}
            onClose={() => setInviteModalOpen(false)}
            projectUrl={currentProject.project.project_url}
        />
      )}
    </>
  );
};

export default ProjectHeader;