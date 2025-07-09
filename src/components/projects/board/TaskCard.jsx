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

const TaskCard = ({ task, onTaskClick, isOverlay = false, isGlobalDragging = false, onDelete, onUpdateName, boardColor, isDoneColumn }) => {
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
    };

    const handleCardClick = (e) => {
        // If the click came from an action button (or anything inside it), do nothing.
        if (e.target.closest('.glass-task-action')) {
            return;
        }
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
                    'p-4 touch-none flex flex-col cursor-pointer',
                    {
                        'glass-task': !isThisCardDragging && !isEditing && !isOverlay,
                        'glass-task editing': isEditing,
                        'bg-transparent border-2 border-dashed border-accent-primary/40 min-h-[5.25rem]': isThisCardDragging && !isOverlay,
                        'invisible': isThisCardDragging && !isOverlay,
                        'glass-task dragging': isOverlay,
                    }
                )}

                onClick={handleCardClick}
                onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !isEditing) handleCardClick(e);
                }}
                role="button"
                tabIndex={isEditing ? -1 : 0}
                aria-label={`View or drag task ${task.task_name}`}
                whileHover={!isThisCardDragging && !isEditing ? { scale: 1.02, y: -2 } : {}}
                whileTap={!isThisCardDragging && !isEditing ? { scale: 0.98 } : {}}
            >
                {(!isThisCardDragging || isOverlay) && (
                    <>
                        <div className="flex-grow">
                            {isEditing ? (
                                <div onBlur={handleSave} className="relative">
                                    <div className="glass-input p-2">
                                        <AIEnhancedInput
                                            value={taskName}
                                            onChange={(e) => setTaskName(e.target.value)}
                                            name="task_name"
                                            placeholder="Enter a task name..."
                                            rows={3}
                                            onEnhance={enhanceTaskName}
                                            className="w-full bg-transparent text-text-primary placeholder-text-placeholder resize-none focus:outline-none"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <p className={clsx(
                                    "text-text-primary mb-3 break-words leading-relaxed text-sm",
                                    { 'line-through text-text-secondary': isDoneColumn }
                                )}>
                                    {task.task_name}
                                </p>
                            )}
                        </div>
                       
                        {!isEditing && (
                            <div className="flex items-end justify-between min-h-[2rem]">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: boardColor || '#8B5CF6' }}></div>
                                    <span className="text-xs font-semibold text-text-primary py-1">
                                        {task.task_key}
                                    </span>
                                    {formattedDeadline && (
                                        <div className="flex items-center gap-1 text-xs font-medium text-text-secondary bg-gradient-to-r from-white/10 to-white/5 px-2 py-1 rounded-md backdrop-blur-sm">
                                            <HiOutlineCalendar className="w-3 h-3" />
                                            <span>{formattedDeadline}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex items-center -space-x-2">
                                    {assignees.slice(0, 3).map(user => (
                                        <div key={user.id} className="relative">
                                            <img
                                                className="w-7 h-7 rounded-full object-cover border-2 border-white/20 shadow-md"
                                                src={user.photo_url || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=3a3a44&color=fff`}
                                                alt={user.first_name}
                                                title={`${user.first_name} ${user.last_name}`}
                                            />
                                        </div>
                                    ))}
                                    {assignees.length > 3 && (
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-xs font-bold text-text-primary shadow-md">
                                            +{assignees.length - 3}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </motion.div>

            {/* Action Buttons */}
            {!isEditing && (
                <div
                    className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    aria-hidden="true"
                >
                    <motion.button 
                        onClick={handleEditClick} 
                        className="p-2 glass-task-action text-text-secondary transition-colors hover:text-blue-400"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Edit task name for ${task.task_name}`}
                    >
                        <HiPencil className="w-4 h-4" />
                    </motion.button>
                    <motion.button 
                        onClick={handleDeleteClick} 
                        className="p-2 glass-task-action text-text-secondary transition-colors hover:text-red-400"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Delete task ${task.task_name}`}
                    >
                        <HiTrash className="w-4 h-4" />
                    </motion.button>
                </div>
            )}
        </div>
    );
};

export default memo(TaskCard);