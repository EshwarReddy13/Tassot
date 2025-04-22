import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDocuments } from '../../global widgets/document_provider.jsx';
import { useUser } from '../../global widgets/user_provider.jsx';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const { getProject, error: providerError, loading: providerLoading } = useDocuments();
  const { userData, loading: userLoading } = useUser();
  const [state, setState] = useState({
    project: null,
    isLoading: false,
    error: '',
  });
  const fetchedProjectIdRef = useRef(null);
  const mountCountRef = useRef(0);
  const lastMountTimeRef = useRef(0);
  const fetchTimeoutRef = useRef(null);

  useEffect(() => {
    mountCountRef.current += 1;
    const now = Date.now();
    if (now - lastMountTimeRef.current < 100) {
      console.warn('Rapid remount detected', { mountCount: mountCountRef.current, projectId });
    }
    lastMountTimeRef.current = now;
    console.log('ProjectDetails mounted', { mountCount: mountCountRef.current, projectId });

    return () => {
      console.log('ProjectDetails unmounted', { mountCount: mountCountRef.current, projectId });
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [projectId]);

  useEffect(() => {
    let isMounted = true;

    const fetchProject = async () => {
      console.log('fetchProject called', {
        projectId,
        uid: userData?.uid,
        userLoading,
        providerLoading,
      });

      if (!projectId) {
        console.log('No projectId');
        if (isMounted) {
          setState((prev) => ({ ...prev, isLoading: false, error: 'No project ID provided' }));
        }
        return;
      }

      if (userLoading) {
        console.log('User data loading');
        if (isMounted) {
          setState((prev) => ({ ...prev, isLoading: true, error: '' }));
        }
        return;
      }

      if (!userData?.uid) {
        console.log('No user UID');
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'User not authenticated',
          }));
        }
        return;
      }

      if (fetchedProjectIdRef.current === projectId && state.project) {
        console.log('Project already fetched', { projectId });
        if (isMounted) {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: '' }));

      try {
        console.log('Calling getProject:', projectId);
        const projectData = await getProject(projectId);
        console.log('getProject result:', projectData);
        if (isMounted) {
          if (projectData.users && projectData.users.includes(userData.uid)) {
            fetchedProjectIdRef.current = projectId;
            setState((prev) => ({
              ...prev,
              project: projectData,
              isLoading: false,
              error: '',
            }));
          } else {
            fetchedProjectIdRef.current = projectId;
            setState((prev) => ({
              ...prev,
              project: null,
              isLoading: false,
              error: 'You do not have access to this project',
            }));
          }
        }
      } catch (err) {
        console.error('fetchProject error:', err);
        if (isMounted) {
          fetchedProjectIdRef.current = projectId;
          setState((prev) => ({
            ...prev,
            project: null,
            isLoading: false,
            error: err.message || 'Failed to load project',
          }));
        }
      }
    };

    fetchProject();

    return () => {
      isMounted = false;
      console.log('ProjectDetails useEffect cleanup', { projectId });
    };
  }, [projectId, getProject, userData?.uid, userLoading]);

  return (
    <main
      className="mt-[4rem] ml-[4rem] mr-4 mb-4 p-6 bg-[#1f1e25] rounded-lg min-h-[calc(100vh-4rem)]"
      aria-label="Project details content"
    >
      {(state.error || providerError) && (
        <motion.p
          className="text-red-400 text-sm mb-4 text-center"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          role="alert"
        >
          {state.error || providerError}
        </motion.p>
      )}

      {(state.isLoading || providerLoading || userLoading) && (
        <motion.p
          className="text-white text-lg text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading project...
        </motion.p>
      )}

      {!state.isLoading && !providerLoading && !userLoading && state.project && userData && (
        <div className="space-y-4 justify-center items-center flex flex-col">
          <motion.h2
            className="text-3xl font-bold text-white text-center"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {state.project.projectName}
          </motion.h2>
          <motion.p
            className="text-white text-lg text-center"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Hello, {userData.firstName} {userData.lastName}
          </motion.p>
          <motion.p
            className="text-white text-md text-center"
            style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Project ID: {state.project.projectId}
          </motion.p>
          <motion.p
            className="text-white text-md text-center"
            style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Created By: {state.project.createdBy === userData.uid ? 'You' : state.project.createdBy}
          </motion.p>
          <motion.p
            className="text-white text-md text-center"
            style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Created At: {new Date(state.project.createdAt.toDate()).toLocaleDateString()}
          </motion.p>
        </div>
      )}
    </main>
  );
};

export default ProjectDetails;