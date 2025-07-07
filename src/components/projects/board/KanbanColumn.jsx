import { memo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard.jsx';
import clsx from 'clsx';
import { HiDotsVertical, HiPencil, HiTrash, HiSparkles, HiPlus } from 'react-icons/hi';

const KanbanColumn = memo(({ 
    column, 
    tasks, 
    onTaskClick, 
    isDragging,
    onDeleteTask,
    onUpdateTaskName,
    currentUserRole, // <-- RECEIVES THE ROLE INSTEAD OF isOwner
    onDeleteBoard,
    onUpdateBoardName,
    onShowAddTaskModal,
    onShowAITaskModal
}) => {
    const { setNodeRef, isOver } = useDroppable({ id: column.id });

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [columnName, setColumnName] = useState(column.name);
    const menuRef = useRef(null);
    const inputRef = useRef(null);

    // --- NEW: Determine if user can manage boards ---
    const canManageBoards = currentUserRole === 'owner' || currentUserRole === 'editor';

    useEffect(() => {
        setColumnName(column.name);
    }, [column.name]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleSaveName = () => {
        if (columnName.trim() && columnName !== column.name) {
            onUpdateBoardName(column.id, columnName.trim());
        } else {
            setColumnName(column.name);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveName();
        }
        if (e.key === 'Escape') {
            setIsEditing(false);
            setColumnName(column.name);
        }
    };

    return (
        <motion.div
            ref={setNodeRef}
            className={clsx(
                'glass-column p-6 flex flex-col min-h-[25rem] relative',
                { 
                    'ring-2 ring-accent-primary/50 shadow-accent-primary/20': isOver,
                }
            )}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
        >
            {/* Column Header */}
            <div className={clsx("flex justify-between items-center mb-6", { 'pointer-events-none': isDragging })}>
                <div className="flex-grow">
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={columnName}
                            onChange={(e) => setColumnName(e.target.value)}
                            onBlur={handleSaveName}
                            onKeyDown={handleKeyDown}
                            className="w-full glass-input text-text-primary font-semibold p-2 rounded-lg focus:border-accent-primary/50 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200"
                            style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}
                            aria-label="Column name"
                        />
                    ) : (
                        <h3 className="text-white font-semibold" style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>
                            {column.name}
                        </h3>
                    )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className="text-sm font-semibold text-text-primary bg-gradient-to-r from-accent-primary/20 to-accent-primary/10 px-3 py-1 rounded-full backdrop-blur-sm">
                        {tasks.length}
                    </span>
                    {/* --- FIX: Use canManageBoards instead of isOwner --- */}
                    {canManageBoards && !isEditing && (
                        <div ref={menuRef} className="relative">
                            <motion.button 
                                onClick={() => setIsMenuOpen(o => !o)} 
                                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label="Column options"
                            >
                                <HiDotsVertical className="w-5 h-5 text-text-secondary" />
                            </motion.button>
                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.15, ease: 'easeOut' }}
                                        className="absolute right-0 top-full mt-2 w-48 glass-column-menu z-20 overflow-hidden"
                                    >
                                        <ul className="py-2" role="menu">
                                            <li role="none">
                                                <motion.button 
                                                    onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}
                                                    className="w-full text-left px-4 py-3 text-sm text-text-primary hover:bg-white/10 flex items-center gap-3 transition-all duration-200"
                                                    whileHover={{ x: 5 }}
                                                    role="menuitem"
                                                >
                                                    <HiPencil className="w-4 h-4 text-blue-400"/> 
                                                    <span>Edit name</span>
                                                </motion.button>
                                            </li>
                                            <li role="none">
                                                <motion.button
                                                    onClick={() => { onDeleteBoard(column.id); setIsMenuOpen(false); }}
                                                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 flex items-center gap-3 transition-all duration-200"
                                                    whileHover={{ x: 5 }}
                                                    role="menuitem"
                                                >
                                                    <HiTrash className="w-4 h-4"/> 
                                                    <span>Delete column</span>
                                                </motion.button>
                                            </li>
                                        </ul>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Tasks Container */}
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="flex-grow space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                    <AnimatePresence>
                        {tasks.map((task) => (
                            <TaskCard 
                                key={task.id} 
                                task={task} 
                                onTaskClick={onTaskClick} 
                                isGlobalDragging={isDragging} 
                                onDelete={onDeleteTask} 
                                onUpdateName={onUpdateTaskName}
                                // We no longer pass permission flags down to TaskCard
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </SortableContext>
            
            {/* Add Task Buttons */}
            <div className="mt-6 space-y-3">
                {!isDragging && canManageBoards && (
                    <>
                        <motion.button
                            onClick={() => onShowAddTaskModal(column.id)}
                            className="w-full text-left p-3 glass-column-button text-text-secondary hover:text-accent-primary"
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            aria-label={`Add a task to ${column.name}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-gradient-to-br from-accent-primary/20 to-accent-primary/10 rounded-lg flex items-center justify-center">
                                    <HiPlus className="w-4 h-4 text-accent-primary" />
                                </div>
                                <span className="font-medium">Add a task</span>
                            </div>
                        </motion.button>
                        
                        <motion.button
                            onClick={() => onShowAITaskModal(column.id)}
                            className="w-full text-left p-3 glass-column-button text-text-secondary hover:text-accent-primary"
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            aria-label={`Create task with AI in ${column.name}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg flex items-center justify-center">
                                    <HiSparkles className="w-4 h-4 text-purple-400" />
                                </div>
                                <span className="font-medium">Create with AI</span>
                            </div>
                        </motion.button>
                    </>
                )}
            </div>

            {/* Drop Zone Indicator */}
            {isOver && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 glass-drop-zone pointer-events-none"
                />
            )}
        </motion.div>
    );
});

export default KanbanColumn;