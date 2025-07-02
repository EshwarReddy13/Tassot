import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../contexts/UserContext.jsx';
import { useProjects } from '../../../contexts/ProjectContext.jsx';
import ProjectCard from '../shared/projectCard.jsx';
import DraggableProjectGrid from '../shared/draggableProjectGrid.jsx';
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

  const isLoading = userLoading || projectsLoading;
  const displayError = userError || projectsError;

  // Separate pinned and unpinned projects
  const pinnedProjects = projects.filter(project => project.isPinned);
  const unpinnedProjects = projects.filter(project => !project.isPinned);

  return (
    <div className="min-h-screen bg-[#292830]">
      <main className="ml-0 md:ml-[4rem] mr-4 pt-6 pb-4 px-4 sm:px-6">
        
        <motion.h1 className="text-white font-bold mb-6" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          Your Projects
        </motion.h1>

        {isLoading && (
          <motion.div className="flex justify-center items-center py-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="w-8 h-8 border-4 border-t-[#9674da] border-[#ffffff33] rounded-full animate-spin" role="status" aria-label="Loading projects" />
            <span className="ml-3 text-white">Loading projects...</span>
          </motion.div>
        )}

        {displayError && !isLoading && (
          <motion.p className="text-red-400 text-center p-4 bg-red-900/20 rounded mb-4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} role="alert">
            Error loading data: {displayError}
          </motion.p>
        )}

        {!isLoading && !displayError && projects.length === 0 && (
          <motion.p className="text-gray-400 text-center py-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            You have no projects yet.{' '}
            <button className="text-[#9674da] hover:underline font-semibold" onClick={() => navigate('/dashboard')}>Create one</button>.
          </motion.p>
        )}

        <AnimatePresence>
          {!isLoading && !displayError && projects.length > 0 && (
            <div className="space-y-8">
              {/* Pinned Projects Section */}
              {pinnedProjects.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">📌</span>
                    Pinned Projects
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
                  </div>
                </motion.div>
              )}

              {/* All Projects Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {pinnedProjects.length > 0 && (
                  <h2 className="text-lg font-semibold text-white mb-4">All Projects</h2>
                )}
                <DraggableProjectGrid
                  projects={unpinnedProjects}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onPinToggle={handlePinToggle}
                  onNavigate={navigate}
                  pinningProject={pinningProject}
                  onReorder={handleReorder}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {editing && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <motion.div initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} className="bg-[#292830] p-6 rounded-lg w-96 shadow-xl">
              <h2 className="text-white text-lg mb-4 font-semibold">Edit Project</h2>
              <label className="block text-gray-300 mb-1 text-sm">Project Name</label>
              <input type="text" className="w-full mb-3 p-2 rounded bg-[#1e1e23] text-white border-2 border-transparent focus:border-accent-primary focus:outline-none" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}/>
              <label className="block text-gray-300 mb-1 text-sm">Project Key (3-4 letters)</label>
              <input type="text" className="w-full mb-4 p-2 rounded bg-[#1e1e23] text-white border-2 border-transparent focus:border-accent-primary focus:outline-none" value={formData.key} onChange={(e) => setFormData({ ...formData, key: e.target.value })}/>
              <div className="flex justify-end space-x-3">
                <button className="px-4 py-2 bg-gray-600 rounded text-white hover:bg-gray-500 transition-colors" onClick={() => setEditing(null)}>Cancel</button>
                <button className="px-4 py-2 bg-[#9674da] rounded text-white hover:bg-accent-hover transition-colors" onClick={saveEdit}>Save Changes</button>
              </div>
            </motion.div>
          </div>
        )}

        {deleting && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
             <motion.div initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} className="bg-[#292830] p-6 rounded-lg w-96 shadow-xl">
              <h2 className="text-white text-lg mb-2 font-semibold">Confirm Deletion</h2>
              <p className="text-gray-300 mb-4 text-sm">Are you sure you want to delete <strong>{deleting.project_name ?? deleting.projectName}</strong>? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button className="px-4 py-2 bg-gray-600 rounded text-white hover:bg-gray-500 transition-colors" onClick={() => setDeleting(null)}>Cancel</button>
                <button className="px-4 py-2 bg-red-600 rounded text-white hover:bg-red-500 transition-colors" onClick={confirmDelete}>Delete Project</button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectsPage;