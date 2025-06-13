import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjects } from '../../../contexts/ProjectContext.jsx';
import { useUser } from '../../../contexts/UserContext.jsx';
import KanbanBoard from './kanbanBoard.jsx';
import TaskDetailsModal from './taskDetails.jsx';
import toast from 'react-hot-toast';

const ProjectDetails = () => {
  const { projectUrl } = useParams();
  const { currentProject, loadingDetails, getProjectDetails, deleteTask, createTask, updateTaskInContext, deleteBoard, updateBoard } = useProjects();
  const { firebaseUser, userData } = useUser();

  const [newColumn, setNewColumn] = useState({ isAdding: false, name: '', error: '' });
  const [addingTask, setAddingTask] = useState({ boardId: null, name: '', error: '' });
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskCreator, setTaskCreator] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const tasks = currentProject?.tasks || [];
  const columns = (currentProject?.boards || []).sort((a, b) => a.position - b.position);

  const addColumnInputRef = useRef(null);
  const addTaskInputRef = useRef(null);
  
  useEffect(() => {
    if (newColumn.isAdding) {
      addColumnInputRef.current?.focus();
    }
  }, [newColumn.isAdding]);

  useEffect(() => {
    if (addingTask.boardId) {
      addTaskInputRef.current?.focus();
    }
  }, [addingTask.boardId]);
  
  const isOwner = currentProject?.project?.owner_id === userData?.id;

  // --- HANDLER TO SAVE THE NEW COLUMN ---
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
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create column.');
      }
      // Re-fetch project details to get the new column and ensure UI is in sync.
      await getProjectDetails(projectUrl);
      setNewColumn({ isAdding: false, name: '', error: '' });
    } catch (err) {
      setNewColumn(prev => ({ ...prev, error: err.message }));
    }
  };
  
  // --- CLICK HANDLER FOR "Add a task" BUTTONS ---
  const handleShowAddTaskForm = (boardId) => {
    setAddingTask({ boardId, name: '', error: '' });
  };
  // --- CANCEL HANDLER FOR THE AddTaskForm ---
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

      createTask(newTask);
      handleCancelAddTask();

    } catch (err) {
      setAddingTask(prev => ({ ...prev, error: err.message }));
      toast.error(err.message);
    }
  };

  const handleTaskClick = async (task) => {
    setSelectedTask(task);
    setTaskCreator(null);
    try {
      if (!task.created_by || !firebaseUser) return;
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/users/id/${task.created_by}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const creatorData = await res.json();
      setTaskCreator(creatorData);
    } catch (error) { console.error("Failed to fetch task creator:", error); }
  };

  const handleCloseModal = () => setSelectedTask(null);

  const handleUpdateTask = async (updatedTaskData) => {
    if (!firebaseUser || !updatedTaskData.id) return;
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/projects/${projectUrl}/tasks/${updatedTaskData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedTaskData),
      });
      const savedTask = await res.json();
      if (!res.ok) throw new Error(savedTask.error || 'Failed to update task.');
      
      updateTaskInContext(savedTask);

      if (selectedTask?.id === savedTask.id) {
        setSelectedTask(savedTask);
      }
      return savedTask;

    } catch (err) {
      console.error("Error updating task:", err);
      toast.error(err.message || "Failed to update task.");
    }
  };

  const handleDeleteTask = (taskId) => {
    if (!isOwner) {
      toast.error("Only the project owner can delete tasks.");
      return;
    }
    if (window.confirm("Are you sure? This action is permanent.")) {
      toast.promise(
        deleteTask(projectUrl, taskId),
        {
          loading: 'Deleting task...',
          success: 'Task deleted!',
          error: (err) => err.message || 'Could not delete task.',
        }
      );
    }
  };
  
  const handleUpdateTaskName = (taskId, newName) => {
    handleUpdateTask({ id: taskId, task_name: newName }).then(savedTask => {
      if (savedTask) { toast.success("Task name updated!"); }
    });
  };

  const handleDeleteBoard = (boardId) => {
    if (!isOwner) {
        toast.error("Only the project owner can delete columns.");
        return;
    }
    const confirmText = "Are you sure you want to delete this column?\nAll tasks within it will also be permanently deleted. Move them first if you wish to keep them.";
    if(window.confirm(confirmText)) {
        toast.promise(deleteBoard(projectUrl, boardId), {
            loading: 'Deleting column...',
            success: 'Column deleted successfully!',
            error: (err) => err.message || 'Could not delete column.',
        });
    }
  };
  
  const handleUpdateBoardName = (boardId, newName) => {
     if (!isOwner) {
        toast.error("Only the project owner can rename columns.");
        return;
    }
    toast.promise(updateBoard(projectUrl, boardId, newName), {
        loading: 'Renaming column...',
        success: 'Column renamed!',
        error: (err) => err.message || 'Could not rename column.',
    });
  };

  const handleDragStart = (event) => {
    setIsDragging(true);
    setActiveTask(tasks.find(t => t.id === event.active.id));
  };
  const handleDragEnd = (event) => {
    setIsDragging(false);
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    const task = tasks.find(t => t.id === active.id);
    const isOverAColumn = columns.some(col => col.id === over.id);
    if (isOverAColumn && task && task.board_id !== over.id) {
      updateTaskInContext({ ...task, board_id: over.id });
      handleUpdateTask({ id: active.id, board_id: over.id });
    }
  };

  if (loadingDetails || !currentProject) {
     return <motion.p className="text-text-secondary text-lg text-center mt-20">Loading board...</motion.p>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 bg-bg-primary min-h-[calc(100vh-4rem)]">
        <KanbanBoard
          columns={columns}
          tasks={tasks}
          onTaskClick={handleTaskClick}
          // --- THE PROP OBJECT THAT CONTROLS THE "ADD NEW COLUMN" FORM ---
          // This object is now passed correctly, containing both state and handlers.
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
          onDeleteTask={handleDeleteTask}
          onUpdateTaskName={handleUpdateTaskName}
          isOwner={isOwner}
          onDeleteBoard={handleDeleteBoard}
          onUpdateBoardName={handleUpdateBoardName}
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