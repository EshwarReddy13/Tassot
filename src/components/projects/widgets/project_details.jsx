import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDocuments } from '../../global widgets/document_provider.jsx';
import { useUser } from '../../global widgets/user_provider.jsx';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const { getProject, updateProject, createTask, updateTask, error: providerError, loading: providerLoading } = useDocuments();
  const { userData, accessUser, loading: userLoading } = useUser();
  const [state, setState] = useState({
    project: null,
    tasks: [],
    columns: [],
    isLoading: false,
    error: '',
  });
  const [newColumn, setNewColumn] = useState({
    name: '',
    isAdding: false,
    error: '',
  });
  const [taskPopup, setTaskPopup] = useState({
    show: false,
    mode: 'add', // 'add', 'view', 'edit'
    task: null,
    board: null,
    taskName: '',
    notes: '',
    createdByName: '',
    error: '',
  });
  const fetchedProjectIdRef = useRef(null);
  const mountCountRef = useRef(0);
  const lastMountTimeRef = useRef(0);
  const fetchTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const userNameCache = useRef(new Map()); // Cache for user names

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
            const columns = [
              ...(projectData.boards || []).map((board, index) => ({
                id: `board-${board.toLowerCase().replace(/\s+/g, '_')}-${index}`,
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

  const handleAddColumnClick = () => {
    setNewColumn({ ...newColumn, isAdding: true, error: '' });
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleColumnNameChange = (e) => {
    const value = e.target.value;
    setNewColumn({ ...newColumn, name: value, error: value ? '' : 'Column name is required' });
  };

  const handleAddColumn = async () => {
    if (!newColumn.name.trim()) {
      setNewColumn({ ...newColumn, error: 'Column name is required' });
      return;
    }

    try {
      await updateProject(projectId, newColumn.name.trim());
      const projectData = await getProject(projectId);
      if (projectData && projectData.users && projectData.users.includes(userData.uid)) {
        const columns = [
          ...(projectData.boards || []).map((board, index) => ({
            id: `board-${board.toLowerCase().replace(/\s+/g, '_')}-${index}`,
            title: board,
          })),
          { id: 'add-column', title: 'Add Column' },
        ];
        setState((prev) => ({
          ...prev,
          project: projectData,
          tasks: projectData.tasks,
          columns,
          error: '',
        }));
        console.log('Columns updated:', columns);
      }
      setNewColumn({ name: '', isAdding: false, error: '' });
    } catch (err) {
      setNewColumn({ ...newColumn, error: 'Failed to add column' });
    }
  };

  const handleCancelAddColumn = () => {
    setNewColumn({ name: '', isAdding: false, error: '' });
  };

  const handleAddTaskClick = (board) => {
    setTaskPopup({
      show: true,
      mode: 'add',
      task: null,
      board,
      taskName: '',
      notes: '',
      createdByName: '',
      error: '',
    });
  };

  const handleTaskClick = async (task) => {
    try {
      let createdByName = userNameCache.current.get(task.createdBy);
      if (!createdByName) {
        console.log('Fetching user name:', { uid: task.createdBy });
        const user = await accessUser(task.createdBy);
        createdByName = `${user.firstName} ${user.lastName}`.trim();
        userNameCache.current.set(task.createdBy, createdByName);
        console.log('User name cached:', { uid: task.createdBy, name: createdByName });
      } else {
        console.log('Using cached user name:', { uid: task.createdBy, name: createdByName });
      }
      setTaskPopup({
        show: true,
        mode: 'view',
        task,
        board: null,
        taskName: task.taskName,
        notes: task.notes,
        createdByName,
        error: '',
      });
    } catch (err) {
      console.error('Error fetching user name:', err);
      setTaskPopup({
        show: true,
        mode: 'view',
        task,
        board: null,
        taskName: task.taskName,
        notes: task.notes,
        createdByName: 'Unknown User',
        error: 'Failed to fetch user name',
      });
    }
  };

  const handleEditTask = () => {
    setTaskPopup((prev) => ({ ...prev, mode: 'edit' }));
  };

  const handleTaskSubmit = async () => {
    if (!taskPopup.taskName.trim()) {
      setTaskPopup((prev) => ({ ...prev, error: 'Task name is required' }));
      return;
    }

    try {
      if (taskPopup.mode === 'add') {
        const taskData = {
          key: state.project.key,
          taskName: taskPopup.taskName.trim(),
          notes: taskPopup.notes.trim(),
          status: taskPopup.board.title,
          createdBy: userData.uid,
        };
        const newTask = await createTask(projectId, taskData);
        setState((prev) => ({
          ...prev,
          tasks: [...prev.tasks, newTask],
          error: '',
        }));
      } else if (taskPopup.mode === 'edit') {
        const updates = {
          taskName: taskPopup.taskName.trim(),
          notes: taskPopup.notes.trim(),
        };
        await updateTask(projectId, taskPopup.task.taskId, updates);
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.taskId === taskPopup.task.taskId ? { ...t, ...updates } : t
          ),
          error: '',
        }));
      }
      setTaskPopup({ show: false, mode: 'add', task: null, board: null, taskName: '', notes: '', createdByName: '', error: '' });
    } catch (err) {
      setTaskPopup((prev) => ({ ...prev, error: 'Failed to save task' }));
    }
  };

  const handleTaskCancel = () => {
    setTaskPopup({ show: false, mode: 'add', task: null, board: null, taskName: '', notes: '', createdByName: '', error: '' });
  };

  const popupVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  const taskVariants = {
    initial: { opacity: 0, y: 10 },
    animate: (taskIndex) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    }),
    exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
  };

  console.log('ProjectDetails render state:', {
    isLoading: state.isLoading,
    error: state.error,
    project: state.project,
    tasks: state.tasks,
    columns: state.columns,
    providerLoading,
    userLoading,
    providerError,
    newColumn,
    taskPopup,
  });

  return (
    <main
      className="mt-[4rem] p-6 bg-bg-primary rounded-lg min-h-[calc(100vh-4rem)]"
      aria-label="Project details and Kanban board"
    >
      {(state.error || providerError || newColumn.error || taskPopup.error) && (
        <motion.p
          className="text-error text-sm mb-4 text-center"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          role="alert"
        >
          {state.error || providerError || newColumn.error || taskPopup.error}
        </motion.p>
      )}

      {(state.isLoading || providerLoading || userLoading) && (
        <motion.p
          className="text-text-primary text-lg text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading project...
        </motion.p>
      )}

      {!state.isLoading && !providerLoading && !userLoading && state.project && userData && (
        <div className="space-y-8">
          <motion.h1
            className="text-3xl font-bold text-text-primary mb-6"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {state.project.projectName}
          </motion.h1>
          <section aria-label="Kanban board">
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
                maxWidth: '100%',
                margin: '0 auto',
              }}
            >
              {state.columns.map((column, columnIndex) => (
                <motion.div
                  key={column.id}
                  className="bg-bg-secondary rounded-lg p-4 min-h-[20rem]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: columnIndex * 0.1 }}
                  role="region"
                  aria-label={`${column.title} column`}
                >
                  <h3
                    className="text-text-primary font-semibold mb-4 text-center"
                    style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
                  >
                    {column.title}
                  </h3>
                  {column.id === 'add-column' ? (
                    <AnimatePresence>
                      {newColumn.isAdding ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <input
                            ref={inputRef}
                            type="text"
                            value={newColumn.name}
                            onChange={handleColumnNameChange}
                            className="w-full bg-bg-card text-text-primary rounded-lg p-2 mb-2 border border-border focus:outline-none focus:ring-2 focus:ring-accent-primary"
                            placeholder="Enter column name"
                            aria-label="New column name"
                          />
                          <div className="flex gap-2">
                            <motion.button
                              className="flex-1 bg-accent-primary text-text-primary py-2 rounded-lg font-semibold hover:bg-accent-hover"
                              onClick={handleAddColumn}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              aria-label="Save new column"
                            >
                              Save
                            </motion.button>
                            <motion.button
                              className="flex-1 border-2 border-accent-primary bg-bg-primary text-text-primary py-2 rounded-lg font-semibold"
                              onClick={handleCancelAddColumn}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              aria-label="Cancel adding column"
                            >
                              Cancel
                            </motion.button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.button
                          className="w-full h-32 flex justify-center items-center bg-bg-card rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                          onClick={handleAddColumnClick}
                          aria-label="Add new column"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <svg
                            className="w-12 h-12 text-text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </motion.button>
                      )}
                    </AnimatePresence>
                  ) : (
                    <div className="space-y-2">
                      <AnimatePresence>
                        {state.tasks
                          .filter((task) => task.status === column.title)
                          .map((task, taskIndex) => (
                            <motion.div
                              key={task.taskId}
                              className="bg-bg-card p-2 rounded-lg text-text-primary cursor-pointer hover:bg-bg-dark"
                              variants={taskVariants}
                              initial="initial"
                              animate="animate"
                              exit="exit"
                              custom={taskIndex}
                              transition={{ duration: 0.3, delay: (columnIndex + 1) * 0.3 + taskIndex * 0.1 }}
                              onClick={() => handleTaskClick(task)}
                              role="button"
                              aria-label={`View task ${task.taskName}`}
                            >
                              <p className="font-medium">{task.taskName}</p>
                              <p className="text-sm text-text-secondary">ID: {task.taskId}</p>
                            </motion.div>
                          ))}
                      </AnimatePresence>
                      <motion.div
                        key={`add-task-${column.id}`}
                        className="bg-bg-card p-2 rounded-lg text-text-primary cursor-pointer hover:bg-bg-dark"
                        variants={taskVariants}
                        initial="initial"
                        animate="animate"
                        custom={state.tasks.filter((task) => task.status === column.title).length}
                        transition={{
                          duration: 0.3,
                          delay: (columnIndex + 1) * 0.3 + state.tasks.filter((task) => task.status === column.title).length * 0.1,
                        }}
                        onClick={() => handleAddTaskClick(column)}
                        role="button"
                        aria-label={`Add new task to ${column.title}`}
                      >
                        <p className="font-medium text-accent-primary">Add a New Task +</p>
                      </motion.div>
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
          className="text-text-secondary text-lg text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          No project data available
        </motion.p>
      )}

      <AnimatePresence>
        {taskPopup.show && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            variants={popupVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <motion.div
              className="bg-bg-dark rounded-lg p-6 w-[32rem]"
              variants={popupVariants}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-text-primary text-xl font-semibold">
                  {taskPopup.mode === 'add' ? 'Add Task' : taskPopup.mode === 'view' ? 'View Task' : 'Edit Task'}
                </h2>
                {taskPopup.mode === 'view' && (
                  <motion.button
                    className="text-text-primary hover:text-accent-primary"
                    onClick={handleEditTask}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Edit task"
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
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-text-primary text-sm font-medium">Task ID</label>
                    <input
                      type="text"
                      value={taskPopup.mode === 'add' ? `${state.project.key}-${state.tasks.length + 1}` : taskPopup.task.taskId}
                      className="w-full h-10 bg-bg-primary text-text-secondary rounded-lg p-2 border border-border mt-1 cursor-not-allowed"
                      disabled
                      aria-label="Task ID"
                    />
                  </div>
                  <div>
                    <label className="text-text-primary text-sm font-medium">Task Name</label>
                    <input
                      type="text"
                      value={taskPopup.taskName}
                      onChange={(e) => setTaskPopup((prev) => ({ ...prev, taskName: e.target.value }))}
                      className={`w-full h-10 bg-bg-primary text-text-primary rounded-lg p-2 border border-border mt-1 ${
                        taskPopup.mode === 'view' ? 'cursor-not-allowed' : 'focus:outline-none focus:ring-2 focus:ring-accent-primary'
                      }`}
                      disabled={taskPopup.mode === 'view'}
                      placeholder="Enter task name"
                      aria-label="Task name"
                    />
                  </div>
                  <div>
                    <label className="text-text-primary text-sm font-medium">Status</label>
                    <input
                      type="text"
                      value={taskPopup.mode === 'add' ? taskPopup.board.title : taskPopup.task.status}
                      className="w-full h-10 bg-bg-primary text-text-secondary rounded-lg p-2 border border-border mt-1 cursor-not-allowed"
                      disabled
                      aria-label="Task status"
                    />
                  </div>
                </div>
                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-text-primary text-sm font-medium">Notes</label>
                    <textarea
                      value={taskPopup.notes}
                      onChange={(e) => setTaskPopup((prev) => ({ ...prev, notes: e.target.value }))}
                      className={`w-full h-20 bg-bg-primary text-text-primary rounded-lg p-2 border border-border mt-1 resize-none ${
                        taskPopup.mode === 'view' ? 'cursor-not-allowed' : 'focus:outline-none focus:ring-2 focus:ring-accent-primary'
                      }`}
                      disabled={taskPopup.mode === 'view'}
                      placeholder="Enter notes"
                      aria-label="Task notes"
                    />
                  </div>
                  {taskPopup.mode !== 'add' && (
                    <>
                      <div>
                        <label className="text-text-primary text-sm font-medium">Created At</label>
                        <input
                          type="text"
                          value={new Date(taskPopup.task.createdAt.toDate()).toLocaleString()}
                          className="w-full h-10 bg-bg-primary text-text-secondary rounded-lg p-2 border border-border mt-1 cursor-not-allowed"
                          disabled
                          aria-label="Task created at"
                        />
                      </div>
                      <div>
                        <label className="text-text-primary text-sm font-medium">Created By</label>
                        <input
                          type="text"
                          value={taskPopup.createdByName}
                          className="w-full h-10 bg-bg-primary text-text-secondary rounded-lg p-2 border border-border mt-1 cursor-not-allowed"
                          disabled
                          aria-label="Task created by"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              {taskPopup.error && (
                <motion.p
                  className="text-error text-sm mt-4 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  role="alert"
                >
                  {taskPopup.error}
                </motion.p>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <motion.button
                  className="border-2 border-accent-primary bg-bg-primary text-text-primary py-2 px-4 rounded-lg font-semibold"
                  onClick={handleTaskCancel}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Cancel task"
                >
                  Cancel
                </motion.button>
                {(taskPopup.mode === 'add' || taskPopup.mode === 'edit') && (
                  <motion.button
                    className="bg-accent-primary text-text-primary py-2 px-4 rounded-lg font-semibold disabled:bg-bg-card disabled:cursor-not-allowed"
                    onClick={handleTaskSubmit}
                    disabled={!taskPopup.taskName.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={taskPopup.mode === 'add' ? 'Add task' : 'Save task'}
                  >
                    {taskPopup.mode === 'add' ? 'Add' : 'Save'}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default ProjectDetails;