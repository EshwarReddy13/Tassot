import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/userContext.jsx';
import { useDocuments } from '../global widgets/documentProvider.jsx';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase.js';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { userData, loading: userLoading, error: userError } = useUser();
  const { getProject, error: documentError } = useDocuments();
  const [state, setState] = useState({
    projects: [],
    isLoading: false,
    error: '',
  });
  const prevProjectsRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      console.log('fetchProjects called', {
        uid: userData?.uid,
        projects: userData?.projects,
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

      let projects = userData.projects;
      if (!Array.isArray(projects) || projects.length === 0) {
        console.log('Projects invalid or empty, fetching from Firestore:', projects);
        try {
          const userDocRef = doc(db, 'users', userData.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            projects = userDoc.data().projects || [];
            console.log('Fetched projects from Firestore:', projects);
          } else {
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
        } catch (err) {
          console.error('Error fetching user document:', err);
          if (isMounted) {
            setState((prev) => ({
              ...prev,
              isLoading: false,
              projects: [],
              error: 'Failed to load user data',
            }));
          }
          return;
        }
      }

      // Only skip if state.projects is already populated and matches userData.projects
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

      setState((prev) => ({ ...prev, isLoading: true, error: '' }));

      try {
        const projectPromises = projects.map(async (projectId) => {
          try {
            console.log(`Fetching project: ${projectId}`);
            const projectData = await getProject(projectId);
            return projectData;
          } catch (err) {
            console.error(`Error fetching project ${projectId}:`, err);
            return null;
          }
        });
        const projectResults = await Promise.all(projectPromises);
        if (isMounted) {
          const validProjects = projectResults.filter((project) => project);
          console.log('Fetched projects:', validProjects);
          setState((prev) => ({
            ...prev,
            projects: validProjects,
            isLoading: false,
            error: validProjects.length === 0 && projects.length > 0 ? 'No valid projects found' : '',
          }));
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
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
  }, [userData?.uid, userData?.projects, userLoading, getProject]);

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-[#292830]">
      <main
        className="ml-[4rem] mr-4 pt-6 pb-4 px-6 min-h-[calc(100vh)]"
        aria-label="Projects list"
      >
        <motion.h1
          className="text-3xl font-bold text-white mb-6"
          style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Your Projects
        </motion.h1>

        {state.error && (
          <motion.p
            className="text-red-400 text-sm mb-4 text-center"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            role="alert"
          >
            {state.error}
          </motion.p>
        )}

        {userError && (
          <motion.p
            className="text-red-400 text-sm mb-4 text-center"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            role="alert"
          >
            {userError}
          </motion.p>
        )}

        {documentError && (
          <motion.p
            className="text-red-400 text-sm mb-4 text-center"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            role="alert"
          >
            {documentError}
          </motion.p>
        )}

        {(state.isLoading || userLoading) && (
          <motion.p
            className="text-white text-lg text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Loading projects...
          </motion.p>
        )}

        {!state.isLoading && !userLoading && state.projects.length === 0 && !state.error && !userError && !documentError && (
          <motion.p
            className="text-gray-400 text-lg text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            You are not part of any projects yet.{' '}
            <button
              className="text-[#9674da] hover:underline"
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
                  className="bg-[#17171b] rounded-lg p-4 hover:bg-[#3a3344] cursor-pointer"
                  onClick={() => handleProjectClick(project.projectId)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View project ${project.projectName}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleProjectClick(project.projectId);
                    }
                  }}
                >
                  <h2 className="text-white text-xl font-semibold mb-2">
                    {project.projectName}
                  </h2>
                  <p className="text-gray-400 text-sm mb-2">
                    ID: {project.projectId}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Created: {new Date(project.createdAt.toDate()).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ProjectsPage;