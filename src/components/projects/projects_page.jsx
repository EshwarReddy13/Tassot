import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../global widgets/user_provider.jsx';
import { useDocuments } from '../global widgets/document_provider.jsx';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { userData, loading: userLoading, error: userError } = useUser();
  const { getProject, updateProjectName, deleteProject, error: documentError } = useDocuments();
  const [state, setState] = useState({
    projects: [],
    isLoading: false,
    error: '',
  });
  const [editPopup, setEditPopup] = useState({ show: false, projectId: null, projectName: '' });
  const [deletePopup, setDeletePopup] = useState({ show: false, projectId: null, input: '' });
  const prevProjectsRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      console.log('fetchProjects called', {
        uid: userData?.uid,
        userLoading,
        currentStateProjects: state.projects,
      });

      if (userLoading) {
        console.log('User data still loading');
        setState((prev) => ({ ...prev, isLoading: true, error: '' }));
        return;
      }

      if (!userData?.uid) {
        console.log('No user UID, setting empty projects');
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            projects: [],
            error: 'User not authenticated',
          }));
        }
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: '' }));

      try {
        const userDocRef = doc(db, 'users', userData.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          console.log('User document not found');
          if (isMounted) {
            setState((prev) => ({
              ...prev,
              isLoading: false,
              projects: [],
              error: 'User data not found',
            }));
          }
          return;
        }

        let projects = userDoc.data().projects || [];
        console.log('Fetched projects from Firestore:', projects);

        if (!Array.isArray(projects) || projects.length === 0) {
          console.log('No projects found');
          if (isMounted) {
            setState((prev) => ({
              ...prev,
              isLoading: false,
              projects: [],
              error: '',
            }));
          }
          return;
        }

        const validProjectIds = [];
        const validationPromises = projects.map(async (projectId) => {
          const projectRef = doc(db, 'projects', projectId);
          const projectDoc = await getDoc(projectRef);
          if (projectDoc.exists()) {
            validProjectIds.push(projectId);
          }
        });
        await Promise.all(validationPromises);

        if (validProjectIds.length < projects.length) {
          console.warn('Invalid project IDs found:', projects.filter(id => !validProjectIds.includes(id)));
          await updateDoc(userDocRef, { projects: validProjectIds });
          console.log('Updated user projects:', validProjectIds);
          projects = validProjectIds;
        }

        if (
          prevProjectsRef.current &&
          JSON.stringify(prevProjectsRef.current) === JSON.stringify(projects) &&
          state.projects.length > 0 &&
          state.projects.every((proj) => projects.includes(proj.projectId))
        ) {
          console.log('Projects unchanged and state populated, skipping fetch');
          if (isMounted) {
            setState((prev) => ({ ...prev, isLoading: false }));
          }
          return;
        }

        prevProjectsRef.current = projects;

        if (projects.length === 0) {
          console.log('No valid projects found');
          if (isMounted) {
            setState((prev) => ({
              ...prev,
              isLoading: false,
              projects: [],
              error: '',
            }));
          }
          return;
        }

        const projectPromises = projects.map(async (projectId) => {
          try {
            console.log(`Fetching project: ${projectId}`);
            const projectData = await getProject(projectId);
            return projectData;
          } catch (err) {
            console.warn(`Skipping project ${projectId}: ${err.message}`);
            return null;
          }
        });
        const projectResults = await Promise.all(projectPromises);
        if (isMounted) {
          const validProjects = projectResults.filter((project) => project);
          console.log('Fetched valid projects:', validProjects);
          setState((prev) => ({
            ...prev,
            projects: validProjects,
            isLoading: false,
            error: validProjects.length === 0 && projects.length > 0 ? 'No valid projects found' : '',
          }));
        }
      } catch (err) {
        console.error('Unexpected error fetching projects:', err);
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'Failed to load projects',
          }));
        }
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
      console.log('ProjectsPage useEffect cleanup');
    };
  }, [userData?.uid, userLoading, getProject]);

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const handleEditClick = (projectId, projectName) => {
    setEditPopup({ show: true, projectId, projectName });
  };

  const handleEditSubmit = async () => {
    if (!editPopup.projectName.trim()) {
      setState((prev) => ({ ...prev, error: 'Project name cannot be empty' }));
      return;
    }

    try {
      await updateProjectName(editPopup.projectId, editPopup.projectName);
      setState((prev) => ({
        ...prev,
        projects: prev.projects.map((proj) =>
          proj.projectId === editPopup.projectId
            ? { ...proj, projectName: editPopup.projectName }
            : proj
        ),
        error: '',
      }));
      setEditPopup({ show: false, projectId: null, projectName: '' });
    } catch (err) {
      setState((prev) => ({ ...prev, error: 'Failed to update project name' }));
    }
  };

  const handleDeleteClick = (projectId) => {
    setDeletePopup({ show: true, projectId, input: '' });
  };

  const handleDeleteConfirm = async () => {
    if (deletePopup.input.toLowerCase() !== 'delete') {
      setState((prev) => ({ ...prev, error: 'Please type "delete" to confirm' }));
      return;
    }

    try {
      await deleteProject(deletePopup.projectId);
      setState((prev) => ({
        ...prev,
        projects: prev.projects.filter((proj) => proj.projectId !== deletePopup.projectId),
        error: '',
      }));
      setDeletePopup({ show: false, projectId: null, input: '' });
    } catch (err) {
      setState((prev) => ({ ...prev, error: 'Failed to delete project' }));
    }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  const popupVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <main
        className="ml-[4rem] mr-4 pt-6 pb-4 px-6 min-h-[calc(100vh)]"
        aria-label="Projects list"
      >
        <motion.h1
          className="text-3xl font-bold text-text-primary mb-6"
          style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Your Projects
        </motion.h1>

        {(state.error || userError || documentError) && (
          <motion.p
            className="text-error text-sm mb-4 text-center"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            role="alert"
          >
            {state.error || userError || documentError}
          </motion.p>
        )}

        {(state.isLoading || userLoading) && (
          <motion.p
            className="text-text-primary text-lg text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Loading projects...
          </motion.p>
        )}

        {!state.isLoading && !userLoading && state.projects.length === 0 && !state.error && !userError && !documentError && (
          <motion.p
            className="text-text-secondary text-lg text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            You are not part of any projects yet.{' '}
            <button
              className="text-accent-primary hover:underline"
              onClick={() => navigate('/dashboard')}
              aria-label="Create a new project"
            >
              Create a project
            </button>
            .
          </motion.p>
        )}

        <AnimatePresence>
          {!state.isLoading && !userLoading && state.projects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.projects.map((project, index) => (
                <motion.div
                  key={project.projectId}
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ delay: index * 0.1 }}
                  className="bg-bg-dark rounded-lg p-4 hover:bg-bg-secondary cursor-pointer relative"
                  onClick={(e) => {
                    if (e.target.closest('.action-button')) return;
                    handleProjectClick(project.projectId);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View project ${project.projectName}`}
                  onKeyDown={(e) => {
                    if (e.target.closest('.action-button')) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleProjectClick(project.projectId);
                    }
                  }}
                >
                  <h2 className="text-text-primary text-xl font-semibold mb-2">
                    {project.projectName}
                  </h2>
                  <p className="text-text-secondary text-sm mb-2">
                    ID: {project.projectId}
                  </p>
                  <p className="text-text-secondary text-sm">
                    Created: {new Date(project.createdAt.toDate()).toLocaleDateString()}
                  </p>
                  <div className="absolute top-4 right-4 flex gap-2 action-button">
                    <motion.button
                      className="text-text-primary hover:text-accent-primary action-button"
                      onClick={() => handleEditClick(project.projectId, project.projectName)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={`Edit project ${project.projectName}`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </motion.button>
                    <motion.button
                      className="text-text-primary hover:text-error action-button"
                      onClick={() => handleDeleteClick(project.projectId)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={`Delete project ${project.projectName}`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0h4m-7 4h10"
                        />
                      </svg>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {editPopup.show && (
            <motion.div
              className="fixed inset-0 bg-[#000]/40 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50"
              variants={popupVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div
                className="bg-bg-dark border-2 border-accent-primary rounded-lg p-6 w-96"
                variants={popupVariants}
              >
                <h2 className="text-text-primary text-xl font-semibold mb-4">
                  Edit Project Name
                </h2>
                <input
                  type="text"
                  value={editPopup.projectName}
                  onChange={(e) => setEditPopup((prev) => ({ ...prev, projectName: e.target.value }))}
                  className="w-full h-12 bg-bg-primary text-text-primary rounded-lg p-2 border border-border focus:outline-none focus:ring-2 focus:ring-accent-primary mb-4"
                  placeholder="Enter new project name"
                  aria-label="New project name"
                />
                <div className="flex justify-end gap-2">
                  <motion.button
                    className="border-2 border-accent-primary bg-bg-primary text-text-primary py-2 px-4 rounded-lg font-semibold"
                    onClick={() => setEditPopup({ show: false, projectId: null, projectName: '' })}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Cancel edit"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    className="bg-accent-primary text-text-primary py-2 px-4 rounded-lg font-semibold disabled:bg-bg-card disabled:cursor-not-allowed"
                    onClick={handleEditSubmit}
                    disabled={!editPopup.projectName.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Save project name"
                  >
                    Save
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {deletePopup.show && (
            <motion.div
              className="fixed inset-0 bg-[#000]/40 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50"
              variants={popupVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div
                className="bg-bg-dark rounded-lg p-6 w-110 border-2 border-warning"
                variants={popupVariants}
              >
                <h2 className="text-text-primary text-xl font-semibold mb-4">
                  Confirm Deletion
                </h2>
                <p className="text-text-secondary mb-4">
                  Type <span className="text-error">"delete"</span> to confirm deletion of this project.
                </p>
                <input
                  type="text"
                  value={deletePopup.input}
                  onChange={(e) => setDeletePopup((prev) => ({ ...prev, input: e.target.value }))}
                  className="w-full h-12 bg-bg-primary text-text-primary rounded-lg p-2 border border-border focus:outline-none focus:ring-2 focus:ring-accent-primary mb-4"
                  placeholder='Type "delete"'
                  aria-label="Confirm deletion input"
                />
                <div className="flex justify-end gap-2">
                  <motion.button
                    className="border-2 border-accent-primary bg-bg-primary text-text-primary py-2 px-4 rounded-lg font-semibold"
                    onClick={() => setDeletePopup({ show: false, projectId: null, input: '' })}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Cancel deletion"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    className="bg-error text-text-primary py-2 px-4 rounded-lg font-semibold disabled:bg-bg-card disabled:cursor-not-allowed"
                    onClick={handleDeleteConfirm}
                    disabled={deletePopup.input.toLowerCase() !== 'delete'}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Confirm delete project"
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ProjectsPage;