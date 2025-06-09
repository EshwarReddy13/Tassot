import { motion } from 'framer-motion';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useProjects } from '../../../contexts/ProjectContext.jsx';
import { useUser } from '../../../contexts/UserContext.jsx';
import KanbanBoard from './kanbanBoard.jsx';

const ProjectDetails = () => {
  const { projectUrl } = useParams(); // We already have the projectUrl here
  const { getProjectDetails } = useProjects();
  const { firebaseUser, userData, loading: userLoading } = useUser();

  const [state, setState] = useState({
    project: null,
    tasks: [],
    columns: [],
    isLoading: true,
    error: '',
  });

  const [newColumn, setNewColumn] = useState({ isAdding: false, name: '', error: '' });
  const [addingTask, setAddingTask] = useState({ boardId: null, name: '', error: '' });

  const addColumnInputRef = useRef(null);
  const addTaskInputRef = useRef(null);
  const fetchedProjectUrlRef = useRef(null);

  const fetchProject = useCallback(async () => {
    if (!projectUrl || userLoading) return;
    if (fetchedProjectUrlRef.current === projectUrl) return;

    fetchedProjectUrlRef.current = projectUrl;
    setState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      const projectData = await getProjectDetails(projectUrl);
      if (!projectData) throw new Error('Project not found or you do not have access.');
      
      const sortedBoards = (projectData.boards || []).sort((a, b) => a.position - b.position);

      setState({
        project: projectData.project,
        tasks: projectData.tasks || [],
        columns: sortedBoards,
        isLoading: false,
        error: '',
      });
    } catch (err) {
      setState(prev => ({ ...prev, isLoading: false, error: err.message || 'Failed to load project data.' }));
    }
  }, [projectUrl, getProjectDetails, userLoading]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);
  
  useEffect(() => {
    if (newColumn.isAdding) addColumnInputRef.current?.focus();
  }, [newColumn.isAdding]);

  useEffect(() => {
    if (addingTask.boardId) addTaskInputRef.current?.focus();
  }, [addingTask.boardId]);

  // --- Column Handlers ---
  const handleAddColumn = async () => {
    if (!newColumn.name.trim()) {
      setNewColumn(prev => ({ ...prev, error: 'Name cannot be empty.' }));
      return;
    }
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/projects/${projectUrl}/boards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newColumn.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create column.');
      
      setState(prev => ({ ...prev, columns: [...prev.columns, data] }));
      setNewColumn({ isAdding: false, name: '', error: '' });
    } catch (err) {
      setNewColumn(prev => ({ ...prev, error: err.message }));
    }
  };

  // --- Task Handlers ---
  const handleShowAddTaskForm = (boardId) => {
    setAddingTask({ boardId, name: '', error: '' });
    setNewColumn({ isAdding: false, name: '', error: '' });
  };

  const handleCancelAddTask = () => {
    setAddingTask({ boardId: null, name: '', error: '' });
  };
  
  const handleCreateTask = async () => {
    if (!addingTask.name.trim()) {
      setAddingTask(prev => ({ ...prev, error: 'Task name cannot be empty.' }));
      return;
    }
    if (!firebaseUser || !addingTask.boardId) return;

    try {
      const token = await firebaseUser.getIdToken();
      // **FIXED FETCH URL**: Include the projectUrl to match the backend route
      const res = await fetch(`/api/projects/${projectUrl}/boards/${addingTask.boardId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ task_name: addingTask.name }),
      });
      const newTask = await res.json();
      if (!res.ok) throw new Error(newTask.error || 'Failed to create task.');

      setState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
      handleCancelAddTask();
    } catch (err) {
      setAddingTask(prev => ({ ...prev, error: err.message }));
    }
  };

  if (state.isLoading) {
    return <motion.p className="text-white text-lg text-center mt-20">Loading project...</motion.p>;
  }

  if (state.error) {
    return <motion.p className="text-red-400 text-sm mb-4 text-center mt-20" role="alert">{state.error}</motion.p>;
  }

  return (
    <main className="mt-[4rem] px-4 sm:px-6 lg:px-8 py-6 bg-bg-primary min-h-[calc(100vh-4rem)]" aria-label="Project Kanban Board">
      {state.project && (
        <KanbanBoard
          columns={state.columns}
          tasks={state.tasks}
          newColumn={{
            isAdding: newColumn.isAdding,
            name: newColumn.name,
            error: newColumn.error,
            onAddColumnClick: () => setNewColumn({ isAdding: true, name: '', error: '' }),
            onColumnNameChange: (e) => setNewColumn({ ...newColumn, name: e.target.value, error: '' }),
            onAddColumn: handleAddColumn,
            onCancelAddColumn: () => setNewColumn({ isAdding: false, name: '', error: '' }),
            addColumnInputRef: addColumnInputRef,
          }}
          addingTask={addingTask}
          onShowAddTaskForm={handleShowAddTaskForm}
          onCancelAddTask={handleCancelAddTask}
          onAddTask={{
            handleNameChange: (name) => setAddingTask(prev => ({ ...prev, name, error: '' })),
            handleSave: handleCreateTask,
            inputRef: addTaskInputRef,
          }}
        />
      )}
    </main>
  );
};

export default ProjectDetails;