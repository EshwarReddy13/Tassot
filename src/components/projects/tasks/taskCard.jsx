import { memo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { HiPencil, HiTrash, HiOutlineCalendar } from 'react-icons/hi';
import { useAI } from '../../../contexts/AIContext.jsx';
import AIEnhancedInput from '../ai/AIEnhancedInput.jsx';

const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('default', { month: 'short', day: 'numeric' }).format(date);
};

const TaskCard = ({ task, onTaskClick, isOverlay = false, isGlobalDragging = false, onDelete, onUpdateName }) => {
    const { enhanceTaskName } = useAI();
    const [isEditing, setIsEditing] = useState(false);
    const [taskName, setTaskName] = useState(task.task_name);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging: isThisCardDragging } = useSortable({
        id: task.id,
        data: { task },
        disabled: isGlobalDragging || isEditing,
    });

    useEffect(() => {
        if (isEditing) {
            setTaskName(task.task_name);
        }
    }, [isEditing, task.task_name]);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 0.2s ease',
        opacity: isThisCardDragging && !isOverlay ? 0.5 : 1,
        zIndex: isOverlay ? 100 : 'auto',
        boxShadow: isOverlay ? '0 1rem 1.5rem rgba(0, 0, 0, 0.3)' : 'none',
        rotate: isOverlay ? '5deg' : '0deg',
    };

    const handleCardClick = (e) => {
        if (isThisCardDragging || isEditing) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        onTaskClick(task);
    };

    const handleSave = () => {
        if (taskName.trim() && taskName.trim() !== task.task_name) {
            onUpdateName(task.id, taskName.trim());
        }
        setIsEditing(false);
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        onDelete(task.id);
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const assignees = task.assignees || [];
    const formattedDeadline = formatDate(task.deadline);

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group">
            <motion.div
                layoutId={task.id}
                className={clsx(
                    'p-4 rounded-sm touch-none transition-all duration-200 flex flex-col',
                    {
                        'bg-bg-card text-text-primary cursor-pointer border-2 border-transparent hover:border-accent-primary focus-visible:border-accent-primary': !isThisCardDragging && !isEditing,
                        'bg-bg-card ring-2 ring-accent-primary': isEditing,
                        'bg-transparent border-2 border-dashed border-accent-primary/60 min-h-[5.25rem]': isThisCardDragging && !isOverlay,
                        'invisible': isThisCardDragging && !isOverlay,
                    }
                )}
                onClick={handleCardClick}
                onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !isEditing) handleCardClick(e);
                }}
                role="button"
                tabIndex={isEditing ? -1 : 0}
                aria-label={`View or drag task ${task.task_name}`}
            >
                {(!isThisCardDragging || isOverlay) && (
                    <>
                        <div className="flex-grow">
                             {isEditing ? (
                                <div onBlur={handleSave}>
                                    <AIEnhancedInput
                                        value={taskName}
                                        onChange={(e) => setTaskName(e.target.value)}
                                        name="task_name"
                                        placeholder="Enter a task name..."
                                        rows={3}
                                        onEnhance={enhanceTaskName}
                                    />
                                </div>
                            ) : (
                                <p className=" text-text-primary mb-2 break-words font-sans" style={{ fontSize: 'clamp(0.5rem, 2vw, 0.95rem)' }}>
                                    {task.task_name}
                                </p>
                            )}
                        </div>
                       
                        {!isEditing && (
                            <div className="flex items-end justify-between mt-2 min-h-[2rem]">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-text-secondary bg-bg-dark px-2 py-1 rounded-md">
                                        {task.task_key}
                                    </span>
                                    {formattedDeadline && (
                                        <div className="flex items-center gap-1 text-xs font-medium text-text-secondary">
                                            <HiOutlineCalendar />
                                            <span>{formattedDeadline}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex items-center -space-x-2">
                                    {assignees.slice(0, 3).map(user => (
                                        <img
                                            key={user.id}
                                            className="w-7.5 h-7.5 rounded-full object-cover border-2 border-bg-card"
                                            src={user.photo_url || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=3a3a44&color=fff`}
                                            alt={user.first_name}
                                            title={`${user.first_name} ${user.last_name}`}
                                        />
                                    ))}
                                    {assignees.length > 3 && (
                                         <div className="w-6 h-6 rounded-full bg-bg-secondary flex items-center justify-center text-xs font-bold text-text-secondary border-2 border-bg-card">
                                            +{assignees.length - 3}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </motion.div>

            {!isEditing && (
                <div
                    className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    aria-hidden="true"
                >
                    <button onClick={handleEditClick} className="p-1 rounded-md text-text-secondary hover:bg-bg-primary hover:text-white" aria-label={`Edit task name for ${task.task_name}`} >
                        <HiPencil className="w-4 h-4" />
                    </button>
                    <button onClick={handleDeleteClick} className="p-1 rounded-md text-red-400 hover:bg-red-900/50 hover:text-red-300" aria-label={`Delete task ${task.task_name}`}>
                        <HiTrash className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default memo(TaskCard);