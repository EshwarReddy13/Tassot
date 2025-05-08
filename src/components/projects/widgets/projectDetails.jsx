import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDocuments } from '../../global widgets/documentProvider.jsx';
import { useUser } from '../../global widgets/userProvider.jsx';

// Map standardized status values to board names (for future task mapping)
const statusToBoardMap = {
  to_do: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

const ProjectDetails = () => {
  const { projectId } = useParams();
  const { getProject, error: providerError, loading: providerLoading } = useDocuments();
  const { userData, loading: userLoading } = useUser();
  const [state, setState] = useState({
    project: null,
    tasks: [],
    columns: [],
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
          if (projectData && projectData.users && projectData.users.includes(userData.uid)) {
            // Generate columns from boards array
            const columns = [
              ...(projectData.boards || []).map((board, index) => ({
                id: `board-${board.toLowerCase().replace(/\s+/g, '_')}-${index}`, // Normalize for unique ID
                title: board,
              })),
              { id: 'add-column', title: 'Add Column' },
            ];
            fetchedProjectIdRef.current = projectId;
            setState((prev) => ({
              ...prev,
              project: projectData,
              tasks: projectData.tasks,
              columns,
              isLoading: false,
              error: '',
            }));
            console.log('Columns:', columns);
            console.log('Tasks:', projectData.tasks);
          } else {
            fetchedProjectIdRef.current = projectId;
            setState((prev) => ({
              ...prev,
              project: null,
              tasks: [],
              columns: [],
              isLoading: false,
              error: projectData ? 'You do not have access to this project' : 'Project not found',
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
            tasks: [],
            columns: [],
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

  console.log('ProjectDetails render state:', {
    isLoading: state.isLoading,
    error: state.error,
    project: state.project,
    tasks: state.tasks,
    columns: state.columns,
    providerLoading,
    userLoading,
    providerError,
  });

  return (
    <main
      className="mt-[4rem] p-6 bg-[#292830] rounded-lg min-h-[calc(100vh-4rem)]"
      aria-label="Project details and Kanban board"
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
        <div className="space-y-8">
          {/* Kanban Board */}
          <section aria-label="Kanban board">
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
                maxWidth: '100%',
                margin: '0 auto',
              }}
            >
              {state.columns.map((column) => (
                <motion.div
                  key={column.id} // Unique key for each column
                  className="bg-[#3a3a44] rounded-lg p-4 min-h-[20rem]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  role="region"
                  aria-label={`${column.title} column`}
                >
                  <h3
                    className="text-white font-semibold mb-4 text-center"
                    style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
                  >
                    {column.title}
                  </h3>
                  {column.id === 'add-column' ? (
                    <button
                      className="w-full h-32 flex justify-center items-center bg-[#4a4a56] rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      onClick={() => alert('Add new column (functionality to be implemented)')}
                      aria-label="Add new column"
                    >
                      <svg
                        className="w-12 h-12 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      {/* Placeholder for tasks */}
                      <p
                        className="text-white text-sm text-center"
                        style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}
                      >
                        Tasks will be displayed here
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      )}

      {!state.isLoading && !providerLoading && !userLoading && !state.project && !state.error && !providerError && (
        <motion.p
          className="text-yellow-400 text-lg text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          No project data available
        </motion.p>
      )}
    </main>
  );
};

export default ProjectDetails;