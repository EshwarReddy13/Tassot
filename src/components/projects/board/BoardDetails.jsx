import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjects } from '../../../contexts/ProjectContext.jsx';
import { useUser } from '../../../contexts/UserContext.jsx';
import { useAI } from '../../../contexts/AIContext.jsx';
import KanbanBoard from './KanbanBoard.jsx';
import TaskDetailsModal from './TaskDetails.jsx';
import AddTaskModal from './AddTaskModal.jsx';
import AITaskCreationModal from '../ai/AITaskCreationModal.jsx';
import toast from 'react-hot-toast';

const ProjectDetails = () => {
    const { projectUrl } = useParams();
    // Getting the current user's role from the context to pass to child components
    const { currentProject, loadingDetails, getProjectDetails, deleteTask, createTask, updateTaskInContext, deleteBoard, updateBoard } = useProjects();
    const { firebaseUser, userData } = useUser();
    const { createTaskWithAI } = useAI();

    const [newColumn, setNewColumn] = useState({ isAdding: false, name: '', error: '' });
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [isAITaskModalOpen, setIsAITaskModalOpen] = useState(false);
    const [initialBoardIdForModal, setInitialBoardIdForModal] = useState(null);
    const [isCreatingTask, setIsCreatingTask] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiGeneratedData, setAiGeneratedData] = useState(null);

    const [selectedTask, setSelectedTask] = useState(null);
    const [taskCreator, setTaskCreator] = useState(null);
    const [activeTask, setActiveTask] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const tasks = currentProject?.tasks || [];
    const columns = (currentProject?.boards || []).sort((a, b) => a.position - b.position);

    // --- NEW: Find the current user's role ---
    const currentUser = currentProject?.members?.find(m => m.id === userData?.id);
    const currentUserRole = currentUser?.role;

    const addColumnInputRef = useRef(null);
    
    useEffect(() => {
        if (newColumn.isAdding) {
            addColumnInputRef.current?.focus();
        }
    }, [newColumn.isAdding]);
    
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
            await getProjectDetails(projectUrl);
            setNewColumn({ isAdding: false, name: '', error: '' });
        } catch (err) {
            setNewColumn(prev => ({ ...prev, error: err.message }));
        }
    };
    
    const handleOpenAddTaskModal = (boardId) => {
        setInitialBoardIdForModal(boardId);
        setAiGeneratedData(null); // Clear any AI data
        setIsAddTaskModalOpen(true);
    };

    const handleOpenAITaskModal = (boardId) => {
        setInitialBoardIdForModal(boardId);
        setIsAITaskModalOpen(true);
    };
    
    const handleCloseAddTaskModal = () => {
        setIsAddTaskModalOpen(false);
        setAiGeneratedData(null); // Clear AI data when modal is closed
    };

    const handleModalCreateTask = async (taskPayload) => {
        if (!firebaseUser || !taskPayload.board_id) return;
        const boardIdForURL = taskPayload.board_id;

        toast.promise(
            fetch(`/api/projects/${projectUrl}/boards/${boardIdForURL}/tasks`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    Authorization: `Bearer ${await firebaseUser.getIdToken()}` 
                },
                body: JSON.stringify(taskPayload),
            }).then(async res => {
                const newTask = await res.json();
                if (!res.ok) throw new Error(newTask.error || 'Failed to create task.');
                createTask(newTask); // Update state via context
                return newTask;
            }),
            {
                loading: 'Creating task...',
                success: 'Task created successfully!',
                error: (err) => err.message || 'Could not create task.',
            }
        );
    };

    const handleAITaskCreation = async (userDescription) => {
        if (!firebaseUser || !initialBoardIdForModal) return;

        try {
            setIsGeneratingAI(true);

            const boardName = columns.find(col => col.id === initialBoardIdForModal)?.name || 'Unknown Board';
            
            // Generate AI content (not final creation)
            const result = await createTaskWithAI(userDescription, projectUrl, boardName, false);
            
            if (result.generated) {
                // Store the generated data and open the AddTaskModal
                setAiGeneratedData(result.generated);
                setIsAITaskModalOpen(false);
                
                // Small delay to show success message before opening task modal
                setTimeout(() => {
                    setIsAddTaskModalOpen(true);
                }, 500);
            }
            
            setIsGeneratingAI(false);
            return result;
        } catch (err) {
            console.error('AI task creation error:', err);
            setIsGeneratingAI(false);
            throw err;
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
    
    // --- FIX: NO PERMISSION CHECK HERE ---
    const handleDeleteTask = (taskId) => {
        if (window.confirm("Are you sure? This action is permanent.")) {
            toast.promise(deleteTask(projectUrl, taskId), {
                loading: 'Deleting task...',
                success: 'Task deleted!',
                error: (err) => err.message || 'Could not delete task.',
            });
        }
    };
    
    // --- NO CHANGE NEEDED HERE ---
    const handleUpdateTaskName = (taskId, newName) => {
        handleUpdateTask({ id: taskId, task_name: newName }).then(savedTask => {
            if (savedTask) { toast.success("Task name updated!"); }
        });
    };

    // --- FIX: NO PERMISSION CHECK HERE ---
    const handleDeleteBoard = (boardId) => {
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
        toast.promise(updateBoard(projectUrl, boardId, { name: newName }), {
            loading: 'Renaming column...',
            success: 'Column renamed!',
            error: (err) => err.message || 'Could not rename column.',
        });
    };

    const handleUpdateBoardColor = (boardId, newColor) => {
        toast.promise(updateBoard(projectUrl, boardId, { color: newColor }), {
            loading: 'Updating color...',
            success: 'Color updated!',
            error: (err) => err.message || 'Could not update color.',
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
        <div className="min-h-[calc(100vh-4rem)] px-4 py-4">
            <KanbanBoard
                columns={columns}
                tasks={tasks}
                onTaskClick={handleTaskClick}
                newColumn={{
                    isAdding: newColumn.isAdding,
                    name: newColumn.name,
                    error: newColumn.error,
                    ref: addColumnInputRef
                }}
                onAddColumn={handleAddColumn}
                onNewColumnChange={(e) => setNewColumn(prev => ({ ...prev, name: e.target.value, error: '' }))}
                onToggleAddColumn={() => setNewColumn(prev => ({ ...prev, isAdding: !prev.isAdding }))}
                onDeleteTask={handleDeleteTask}
                onUpdateTaskName={handleUpdateTaskName}
                onDeleteBoard={handleDeleteBoard}
                onUpdateBoardName={handleUpdateBoardName}
                onUpdateBoardColor={handleUpdateBoardColor}
                onShowAddTaskModal={handleOpenAddTaskModal}
                onShowAITaskModal={handleOpenAITaskModal}
                activeTask={activeTask}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                isDragging={isDragging}
                currentUserRole={currentUserRole} // --- PASS ROLE, NOT 'isOwner' ---
            />
            {selectedTask && (
                <TaskDetailsModal
                    isOpen={!!selectedTask}
                    onClose={handleCloseModal}
                    task={selectedTask}
                    boards={columns}
                    onUpdateTask={handleUpdateTask}
                    creator={taskCreator}
                    members={currentProject?.members || []}
                />
            )}
            <AddTaskModal
                isOpen={isAddTaskModalOpen}
                onClose={handleCloseAddTaskModal}
                onSubmit={handleModalCreateTask}
                members={currentProject?.members || []}
                boards={columns || []}
                initialBoardId={initialBoardIdForModal}
                prefillData={aiGeneratedData}
            />
            <AITaskCreationModal
                isOpen={isAITaskModalOpen}
                onClose={() => setIsAITaskModalOpen(false)}
                onSubmit={handleAITaskCreation}
                isGenerating={isGeneratingAI}
            />
        </div>
    );
};

export default ProjectDetails;