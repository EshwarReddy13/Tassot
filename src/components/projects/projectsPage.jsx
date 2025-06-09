// src/pages/ProjectsPage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext.jsx';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { firebaseUser, userData, loading: userLoading, error: userError } = useUser();
  const {
    projects,
    fetchUserProjects,
    loadingFetch: projectsLoading,
    errorFetch: projectsError
  } = useProjects();

  // Modal & form state
  const [editing, setEditing]       = useState(null);
  const [deleting, setDeleting]     = useState(null);
  const [formData, setFormData]     = useState({ name: '', key: '' });
  const [modalError, setModalError] = useState('');

  // DEBUG: log userData whenever it changes
  useEffect(() => {
    console.log('🔍 [DEBUG] userData:', userData);
  }, [userData]);

  useEffect(() => {
    if (firebaseUser) {
      console.log('🔄 [DEBUG] fetching projects for', firebaseUser.uid);
      fetchUserProjects();
    }
  }, [firebaseUser, fetchUserProjects]);

  // DEBUG: log projects list whenever it updates
  useEffect(() => {
    console.log('🔍 [DEBUG] projects array:', projects);
  }, [projects]);

  const handleEditClick = (project) => {
    const ownerId = project.owner_id ?? project.ownerId;
    console.log('✏️ [DEBUG] Edit clicked for project:', project);
    console.log('    userData.id:', userData?.uid, 'ownerId:', ownerId, 'match?', userData?.id === ownerId);

    if (!userData?.uid) {
      setModalError('⚠️ [DEBUG] No userData.id, user not loaded yet');
      return;
    }
    if (userData.uid !== ownerId) {
      setModalError('Only the project owner may edit.');
      return;
    }

    // clear any previous errors
    setModalError('');
    setEditing(project);
    setFormData({
      name: project.project_name ?? project.projectName,
      key:  project.project_key  ?? project.projectKey
    });
  };

  const handleDeleteClick = (project) => {
    const ownerId = project.owner_id ?? project.ownerId;
    console.log('🗑️ [DEBUG] Delete clicked for project:', project);
    console.log('    userData.id:', userData?.id, 'ownerId:', ownerId, 'match?', userData?.id === ownerId);

    if (!userData?.id) {
      setModalError('⚠️ [DEBUG] No userData.id, user not loaded yet');
      return;
    }
    if (userData.id !== ownerId) {
      setModalError('Only the project owner may delete.');
      return;
    }

    setModalError('');
    setDeleting(project);
  };

  const saveEdit = async () => {
    console.log('💾 [DEBUG] saveEdit called with formData:', formData);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/projects/${editing.project_url ?? editing.projectUrl}`, {
        method: 'PATCH',
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
      console.log('💾 [DEBUG] patch response:', res.status, data);
      if (!res.ok) throw new Error(data.error || 'Failed to update project');
      setEditing(null);
      fetchUserProjects();
    } catch (err) {
      console.error('💥 [DEBUG] saveEdit error:', err);
      setModalError(err.message);
    }
  };

  const confirmDelete = async () => {
    console.log('💥 [DEBUG] confirmDelete called for', deleting);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/projects/${deleting.project_url ?? deleting.projectUrl}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log('💥 [DEBUG] delete response:', res.status, data);
      if (!res.ok) throw new Error(data.error || 'Failed to delete project');
      setDeleting(null);
      fetchUserProjects();
    } catch (err) {
      console.error('💥 [DEBUG] confirmDelete error:', err);
      setModalError(err.message);
    }
  };

  const isLoading    = userLoading || projectsLoading;
  const displayError = userError  || projectsError;

  return (
    <div className="min-h-screen bg-[#292830]">
      <main className="ml-0 md:ml-[4rem] mr-4 pt-6 pb-4 px-4 sm:px-6">
        {/* Inline modal permission errors */}
        {modalError && (
          <motion.p
            className="text-red-400 text-center mb-4"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {modalError}
          </motion.p>
        )}

        <motion.h1
          className="text-white font-bold mb-6"
          style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Your Projects
        </motion.h1>

        {/* Loading */}
        {isLoading && (
          <motion.div
            className="flex justify-center items-center py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="w-8 h-8 border-4 border-t-[#9674da] border-[#ffffff33] rounded-full animate-spin"
              role="status"
              aria-label="Loading projects"
            />
            <span className="ml-3 text-white">Loading projects...</span>
          </motion.div>
        )}

        {/* Fetch error */}
        {displayError && !isLoading && (
          <motion.p
            className="text-red-400 text-center p-4 bg-red-900/20 rounded mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
          >
            Error loading data: {displayError}
          </motion.p>
        )}

        {/* No projects */}
        {!isLoading && !displayError && projects.length === 0 && (
          <motion.p
            className="text-gray-400 text-center py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            You have no projects yet.{' '}
            <button
              className="text-[#9674da] hover:underline font-semibold"
              onClick={() => navigate('/dashboard')}
            >
              Create one
            </button>
            .
          </motion.p>
        )}

        {/* Projects grid */}
        <AnimatePresence>
          {!isLoading && !displayError && projects.length > 0 && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {projects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  className="relative bg-[#17171b] rounded-lg p-4 hover:bg-[#2a2933] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9674da]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <p
                    className="text-xl text-white font-semibold mb-2 truncate"
                    title={project.project_name ?? project.projectName}
                    onClick={() => navigate(`/projects/${project.project_url ?? project.projectUrl}`)}
                  >
                    {project.project_name ?? project.projectName}
                  </p>
                  <p className="text-gray-400 text-sm font-mono mb-2">
                    ID: {project.project_url ?? project.projectUrl}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Created:{' '}
                    {new Date(
                      project.created_at   ?? project.createdAt
                    ).toLocaleDateString()}
                  </p>

                  {/* Edit/Delete icons */}
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <HiOutlinePencil
                      className="w-5 h-5 text-white hover:text-[#9674da]"
                      role="button"
                      aria-label="Edit project"
                      onClick={() => handleEditClick(project)}
                    />
                    <HiOutlineTrash
                      className="w-5 h-5 text-white hover:text-red-500"
                      role="button"
                      aria-label="Delete project"
                      onClick={() => handleDeleteClick(project)}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[#292830] p-6 rounded-lg w-96">
              <h2 className="text-white text-lg mb-4">Edit Project</h2>
              {modalError && <p className="text-red-400 mb-2">{modalError}</p>}
              <label className="block text-gray-300 mb-1">Name</label>
              <input
                type="text"
                className="w-full mb-3 p-2 rounded bg-[#1e1e23] text-white"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <label className="block text-gray-300 mb-1">Key</label>
              <input
                type="text"
                className="w-full mb-4 p-2 rounded bg-[#1e1e23] text-white"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              />
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-600 rounded text-white"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-[#9674da] rounded text-white"
                  onClick={saveEdit}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleting && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[#292830] p-6 rounded-lg w-80">
              <p className="text-white mb-4">
                Are you sure you want to delete{' '}
                <strong>{deleting.project_name ?? deleting.projectName}</strong>?
              </p>
              {modalError && <p className="text-red-400 mb-2">{modalError}</p>}
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-600 rounded text-white"
                  onClick={() => setDeleting(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 rounded text-white"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectsPage;