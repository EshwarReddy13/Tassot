import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../contexts/UserContext.jsx';
import { useProjects } from '../../../contexts/ProjectContext.jsx';
import ProjectCard from './ProjectCard.jsx';
import CreateProjectCard from './CreateProjectCard.jsx';
import DraggableProjectGrid from './DraggableProjectGrid.jsx';
import toast from 'react-hot-toast'; // Used for better user feedback

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { firebaseUser, userData, loading: userLoading, error: userError } = useUser();
  const {
    projects,
    fetchUserProjects,
    loadingFetch: projectsLoading,
    errorFetch: projectsError,
    pinProject,
    updateProjectOrder
  } = useProjects();

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [formData, setFormData] = useState({ name: '', key: '' });
  const [pinningProject, setPinningProject] = useState(null);
  const [reorderingProjects, setReorderingProjects] = useState(false);
  const [showCreateProjectDrawer, setShowCreateProjectDrawer] = useState(false);
  
  // No longer needed, as we'll use react-hot-toast for feedback
  // const [modalError, setModalError] = useState('');

  useEffect(() => {
    if (firebaseUser) {
      fetchUserProjects();
    }
  }, [firebaseUser, fetchUserProjects]);


  // --- THIS IS THE FIX: The checks now compare `userData.id` with `project.ownerId` ---
  const handleEditClick = (project) => {
    const ownerId = project.owner_id ?? project.ownerId;

    if (userData?.id !== ownerId) {
      toast.error('Only the project owner may edit.');
      return;
    }

    setEditing(project);
    setFormData({
      name: project.project_name ?? project.projectName,
      key:  project.project_key  ?? project.projectKey
    });
  };

  const handleDeleteClick = (project) => {
    const ownerId = project.owner_id ?? project.ownerId;
    
    if (userData?.id !== ownerId) {
      toast.error('Only the project owner may delete.');
      return;
    }

    setDeleting(project);
  };
  // --- END OF FIX ---

  const handlePinToggle = async (projectUrl) => {
    if (pinningProject) return; // Prevent multiple simultaneous pin operations
    
    setPinningProject(projectUrl);
    try {
      const result = await pinProject(projectUrl);
      toast.success(result.message);
    } catch (error) {
      toast.error(error.message || 'Failed to pin/unpin project');
    } finally {
      setPinningProject(null);
    }
  };

  const handleReorder = async (projectOrders) => {
    if (reorderingProjects) return; // Prevent multiple simultaneous reorder operations
    
    setReorderingProjects(true);
    try {
      const result = await updateProjectOrder(projectOrders);
      toast.success(result.message);
    } catch (error) {
      toast.error(error.message || 'Failed to reorder projects');
    } finally {
      setReorderingProjects(false);
    }
  };

  const saveEdit = async () => {
    try {
      const token = await firebaseUser.getIdToken();
      // Switched to PUT for semantic correctness (updating an existing resource)
      const res = await fetch(`/api/projects/${editing.project_url ?? editing.projectUrl}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_name: formData.name,
          project_key:  formData.key,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update project');
      
      toast.success('Project updated successfully!');
      setEditing(null);
      fetchUserProjects();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const confirmDelete = async () => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/projects/${deleting.project_url ?? deleting.projectUrl}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      // DELETE requests might return 204 No Content on success
      if (!res.ok && res.status !== 204) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete project');
      }

      toast.success('Project deleted successfully!');
      setDeleting(null);
      fetchUserProjects();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreateProjectClick = () => {
    navigate('/dashboard');
  };

  const isLoading = userLoading || projectsLoading;
  const displayError = userError || projectsError;

  // Separate pinned and unpinned projects
  const pinnedProjects = projects.filter(project => project.isPinned);
  const unpinnedProjects = projects.filter(project => !project.isPinned);

  return (
    <div className="min-h-screen">
      <main className="ml-0 mr-4 pt-6 pb-4 px-4 sm:px-6">
        
        <motion.h1 className="text-text-primary font-bold" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          Projects
        </motion.h1>
        <div className="w-24 h-0.5 bg-accent-primary rounded-full mb-6 mt-1.5 ml-6"></div>

        {isLoading && (
          <motion.div 
            className="glass-card flex justify-center items-center py-10 mb-6" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.5 }}
          >
            <div className="w-8 h-8 border-4 border-t-accent-primary border-border-primary rounded-full animate-spin" role="status" aria-label="Loading projects" />
            <span className="ml-3 text-text-primary">Loading projects...</span>
          </motion.div>
        )}

        {displayError && !isLoading && (
          <motion.div 
            className="glass-card text-error text-center p-6 mb-6 border-l-4 border-error" 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            role="alert"
          >
            <div className="flex items-center justify-center mb-2">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h3 className="font-semibold">Error Loading Data</h3>
            </div>
            <p className="text-sm opacity-90">{displayError}</p>
          </motion.div>
        )}

        {!isLoading && !displayError && projects.length === 0 && (
          <motion.div 
            className="glass-card text-center py-12 mb-6" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4 opacity-50">📁</div>
            <h3 className="text-text-primary text-lg font-semibold mb-2">No Projects Yet</h3>
            <p className="text-text-secondary mb-4">
              Get started by creating your first project
            </p>
            <button 
              className="glass-button px-6 py-3 text-accent-primary font-semibold"
              onClick={() => navigate('/dashboard')}
            >
              Create Your First Project
            </button>
          </motion.div>
        )}

        <AnimatePresence>
          {!isLoading && !displayError && projects.length > 0 && (
            <div className="space-y-8">
              {/* Pinned Projects Section */}
              {pinnedProjects.length > 0 && (
                <motion.div 
                  className="p-6"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center">
                    Bookmarked Projects
                    <span className="ml-2 text-sm font-normal text-text-secondary bg-accent-primary/20 px-2 py-1 rounded-full">
                      {pinnedProjects.length}
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {pinnedProjects.map((project, idx) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        index={idx}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onPinToggle={handlePinToggle}
                        onNavigate={navigate}
                        isPinning={pinningProject === (project.projectUrl ?? project.project_url)}
                      />
                    ))}
                    <CreateProjectCard
                      onClick={handleCreateProjectClick}
                      index={pinnedProjects.length}
                    />
                  </div>
                </motion.div>
              )}

              {/* All Projects Section */}
              <motion.div 
                className="p-6"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {pinnedProjects.length > 0 && (
                  <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center">
                    All Projects
                    <span className="ml-2 text-sm font-normal text-text-secondary bg-accent-primary/20 px-2 py-1 rounded-full">
                      {projects.length}
                    </span>
                  </h2>
                )}
                <DraggableProjectGrid
                  projects={unpinnedProjects}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onPinToggle={handlePinToggle}
                  onNavigate={navigate}
                  pinningProject={pinningProject}
                  onReorder={handleReorder}
                  onCreateProject={handleCreateProjectClick}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Project Modal */}
        {editing && (
          <div 
            className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4"
            onClick={() => setEditing(null)}
            onKeyDown={(e) => e.key === 'Escape' && setEditing(null)}
            tabIndex={0}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="glass-modal w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-text-primary text-xl font-semibold">Edit Project</h2>
                <button 
                  onClick={() => setEditing(null)}
                  className="glass-hover p-2 rounded-full text-text-secondary hover:text-text-primary"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-text-secondary mb-2 text-sm font-medium">
                    Project Name
                  </label>
                  <input 
                    type="text" 
                    className="glass-input w-full p-3 text-text-primary" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter project name"
                  />
                </div>
                
                <div>
                  <label className="block text-text-secondary mb-2 text-sm font-medium">
                    Project Key
                    <span className="text-xs ml-1 opacity-75">(3-4 letters)</span>
                  </label>
                  <input 
                    type="text" 
                    className="glass-input w-full p-3 text-text-primary" 
                    value={formData.key} 
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder="e.g., PROJ"
                    maxLength={4}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8">
                <button 
                  className="glass-button px-6 py-3 text-text-secondary hover:text-text-primary" 
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
                <button 
                  className="glass-button px-6 py-3 bg-accent-primary text-white hover:bg-accent-primary/80" 
                  onClick={saveEdit}
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Project Modal */}
        {deleting && (
          <div 
            className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4"
            onClick={() => setDeleting(null)}
            onKeyDown={(e) => e.key === 'Escape' && setDeleting(null)}
            tabIndex={0}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="glass-modal w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-text-primary text-xl font-semibold flex items-center">
                  <svg className="w-6 h-6 mr-2 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Confirm Deletion
                </h2>
                <button 
                  onClick={() => setDeleting(null)}
                  className="glass-hover p-2 rounded-full text-text-secondary hover:text-text-primary"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="glass-secondary p-4 rounded-lg mb-6 border-l-4 border-error">
                <p className="text-text-primary text-sm">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-error">
                    {deleting.project_name ?? deleting.projectName}
                  </span>
                  ?
                </p>
                <p className="text-text-secondary text-xs mt-2">
                  This action cannot be undone and will permanently remove all project data.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  className="glass-button px-6 py-3 text-text-secondary hover:text-text-primary" 
                  onClick={() => setDeleting(null)}
                >
                  Cancel
                </button>
                <button 
                  className="glass-button px-6 py-3 bg-error text-white hover:bg-error/80" 
                  onClick={confirmDelete}
                >
                  Delete Project
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectsPage;