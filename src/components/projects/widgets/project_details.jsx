import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDocuments } from '../../global widgets/document_provider.jsx';
import { useUser } from '../../global widgets/user_provider.jsx';
import KanbanBoard from './kanban_board.jsx';
import { TaskPopup, ColumnPopup } from './Popups.jsx';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const { getProject, updateProject, updateColumnName, createTask, updateTask, error: providerError, loading: providerLoading } = useDocuments();
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
  const [columnPopup, setColumnPopup] = useState({
    show: false,
    board: null,
    columnName: '',
    error: '',
  });
  const fetchedProjectIdRef = useRef(null);
  const mountCountRef = useRef(0);
  const lastMountTimeRef = useRef(0);
  const fetchTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const userNameCache = useRef(new Map());

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

  const handleEditColumnClick = (board) => {
    setColumnPopup({
      show: true,
      board,
      columnName: board.title,
      error: '',
    });
  };

  const handleColumnNameEditChange = (e) => {
    const value = e.target.value;
    setColumnPopup((prev) => ({
      ...prev,
      columnName: value,
      error: value ? '' : 'Column name is required',
    }));
  };

  const handleEditColumnSubmit = async () => {
    if (!columnPopup.columnName.trim()) {
      setColumnPopup((prev) => ({ ...prev, error: 'Column name is required' }));
      return;
    }

    try {
      await updateColumnName(projectId, columnPopup.board.title, columnPopup.columnName.trim());
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
      setColumnPopup({ show: false, board: null, columnName: '', error: '' });
    } catch (err) {
      setColumnPopup((prev) => ({ ...prev, error: 'Failed to update column name' }));
    }
  };

  const handleEditColumnCancel = () => {
    setColumnPopup({ show: false, board: null, columnName: '', error: '' });
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

  return (
    <main
      className="mt-[4rem] p-6 bg-bg-primary rounded-lg min-h-[calc(100vh-4rem)]"
      aria-label="Project details and Kanban board"
    >
      {(state.error || providerError || newColumn.error || taskPopup.error || columnPopup.error) && (
        <motion.p
          className="text-error text-sm mb-4 text-center"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          role="alert"
        >
          {state.error || providerError || newColumn.error || taskPopup.error || columnPopup.error}
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
          <KanbanBoard
            columns={state.columns}
            tasks={state.tasks}
            newColumn={newColumn}
            onAddColumnClick={handleAddColumnClick}
            onColumnNameChange={handleColumnNameChange}
            onAddColumn={handleAddColumn}
            onCancelAddColumn={handleCancelAddColumn}
            onEditColumnClick={handleEditColumnClick}
            onAddTaskClick={handleAddTaskClick}
            onTaskClick={handleTaskClick}
            inputRef={inputRef}
            updateTask={updateTask}
            projectId={projectId}
            setTasks={(tasks) => setState((prev) => ({ ...prev, tasks }))}
          />
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

      <TaskPopup
        show={taskPopup.show}
        mode={taskPopup.mode}
        task={taskPopup.task}
        board={taskPopup.board}
        taskName={taskPopup.taskName}
        notes={taskPopup.notes}
        createdByName={taskPopup.createdByName}
        error={taskPopup.error}
        projectKey={state.project?.key}
        taskCount={state.tasks.length}
        onTaskNameChange={(e) => setTaskPopup((prev) => ({ ...prev, taskName: e.target.value }))}
        onNotesChange={(e) => setTaskPopup((prev) => ({ ...prev, notes: e.target.value }))}
        onEditTask={handleEditTask}
        onSubmit={handleTaskSubmit}
        onCancel={handleTaskCancel}
        updateTask={updateTask}
        projectId={projectId}
        setTasks={(tasks) => setState((prev) => ({ ...prev, tasks }))}
        columns={state.columns}
        onClose={() => setTaskPopup({ show: false, mode: 'add', task: null, board: null, taskName: '', notes: '', createdByName: '', error: '' })}
      />

      <ColumnPopup
        show={columnPopup.show}
        board={columnPopup.board}
        columnName={columnPopup.columnName}
        error={columnPopup.error}
        onColumnNameChange={handleColumnNameEditChange}
        onSubmit={handleEditColumnSubmit}
        onCancel={handleEditColumnCancel}
      />
    </main>
  );
};

export default ProjectDetails;