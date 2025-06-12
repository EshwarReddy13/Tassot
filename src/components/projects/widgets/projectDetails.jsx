import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjects } from '../../../contexts/ProjectContext.jsx';
import { useUser } from '../../../contexts/UserContext.jsx';
import KanbanBoard from './kanbanBoard.jsx';
import TaskDetailsModal from './taskDetails.jsx';

const ProjectDetails = () => {
  const { projectUrl } = useParams();
  // --- REFACTORED: Consume data directly from the context ---
  const { currentProject, loadingDetails } = useProjects();
  const { firebaseUser } = useUser();

  // This state is now ONLY for UI interactions, not for storing core data
  const [newColumn, setNewColumn] = useState({ isAdding: false, name: '', error: '' });
  const [addingTask, setAddingTask] = useState({ boardId: null, name: '', error: '' });
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskCreator, setTaskCreator] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);

  const addColumnInputRef = useRef(null);
  const addTaskInputRef = useRef(null);
  
  // --- REFACTORED: Populate local state from context when it changes ---
  useEffect(() => {
    if (currentProject) {
      setTasks(currentProject.tasks || []);
      const sortedBoards = (currentProject.boards || []).sort((a, b) => a.position - b.position);
      setColumns(sortedBoards);
    }
  }, [currentProject]);

  // --- REMOVED: All old data-fetching logic (fetchProject, useState for project, etc.) ---

  useEffect(() => {
    if (newColumn.isAdding) addColumnInputRef.current?.focus();
  }, [newColumn.isAdding]);

  useEffect(() => {
    if (addingTask.boardId) addTaskInputRef.current?.focus();
  }, [addingTask.boardId]);

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
      
      setColumns(prev => [...prev, data]);
      setNewColumn({ isAdding: false, name: '', error: '' });
    } catch (err) {
      setNewColumn(prev => ({ ...prev, error: err.message }));
    }
  };

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
      const res = await fetch(`/api/projects/${projectUrl}/boards/${addingTask.boardId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ task_name: addingTask.name }),
      });
      const newTask = await res.json();
      if (!res.ok) throw new Error(newTask.error || 'Failed to create task.');

      setTasks(prev => [...prev, newTask]);
      handleCancelAddTask();
    } catch (err) {
      setAddingTask(prev => ({ ...prev, error: err.message }));
    }
  };

  const handleTaskClick = async (task) => {
    setSelectedTask(task);
    setTaskCreator(null);
    if (!task.created_by || !firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/users/id/${task.created_by}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Could not fetch task creator details.');
      const creatorData = await res.json();
      setTaskCreator(creatorData);
    } catch (error) {
      console.error("Failed to fetch task creator:", error);
    }
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
    setTaskCreator(null);
  };

  const handleUpdateTask = async (updatedTaskData) => {
    if (!firebaseUser) return;
    const taskId = updatedTaskData.id;
    if (!taskId) return;

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/projects/${projectUrl}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedTaskData),
      });
      const savedTask = await res.json();
      if (!res.ok) throw new Error(savedTask.error || 'Failed to update task.');
      setTasks(prev => prev.map(t => (t.id === savedTask.id ? savedTask : t)));
      if (selectedTask && selectedTask.id === savedTask.id) {
        setSelectedTask(savedTask);
      }
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const handleDragStart = (event) => {
    setIsDragging(true);
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    setIsDragging(false);
    const { active, over } = event;
    setActiveTask(null);
    
    if (!over) return;
    
    const activeTaskId = active.id;
    const overBoardId = over.id;

    const isOverAColumn = columns.some(col => col.id === overBoardId);
    if (!isOverAColumn) return;

    const task = tasks.find(t => t.id === activeTaskId);
    if (!task || task.board_id === overBoardId) return;

    setTasks(prev => prev.map(t => t.id === activeTaskId ? { ...t, board_id: overBoardId } : t));
    handleUpdateTask({ id: activeTaskId, board_id: overBoardId });
  };

  // --- REMOVED: Local loading/error checks. Parent handles this. ---
  if (loadingDetails || !currentProject) {
     return <motion.p className="text-white text-lg text-center mt-20">Loading board...</motion.p>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 bg-bg-primary min-h-[calc(100vh-4rem)]" aria-label="Project Kanban Board">
        <KanbanBoard
          columns={columns}
          tasks={tasks}
          onTaskClick={handleTaskClick}
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
          activeTask={activeTask}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          isDragging={isDragging}
        />
      {selectedTask && (
        <TaskDetailsModal
          isOpen={!!selectedTask}
          onClose={handleCloseModal}
          task={selectedTask}
          boards={columns}
          onUpdateTask={handleUpdateTask}
          creator={taskCreator}
        />
      )}
    </div>
  );
};

export default ProjectDetails;