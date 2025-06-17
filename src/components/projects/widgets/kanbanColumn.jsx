import { memo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './taskCard.jsx';
import clsx from 'clsx';
import { HiDotsVertical, HiPencil, HiTrash } from 'react-icons/hi';

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
    onShowAddTaskModal
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
            className={clsx('bg-bg-secondary rounded-xl p-4 flex flex-col min-h-[25rem] transition-colors', { 'gradient-border': isOver })}
        >
            <div className={clsx("flex justify-between items-start mb-4", { 'pointer-events-none': isDragging })}>
                
                <div className="flex-grow">
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={columnName}
                            onChange={(e) => setColumnName(e.target.value)}
                            onBlur={handleSaveName}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-bg-primary text-text-primary font-semibold p-1 -m-1 rounded-md outline-none ring-2 ring-accent-primary"
                            style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}
                            aria-label="Column name"
                        />
                    ) : (
                        <h3 className="text-white font-semibold" style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>
                            {column.name}
                        </h3>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-sm font-medium text-text-secondary bg-bg-primary px-2 py-1 rounded-full">
                        {tasks.length}
                    </span>
                    {/* --- FIX: Use canManageBoards instead of isOwner --- */}
                    {canManageBoards && !isEditing && (
                        <div ref={menuRef} className="relative">
                            <button 
                                onClick={() => setIsMenuOpen(o => !o)} 
                                className="p-1 rounded-full hover:bg-bg-primary"
                                aria-label="Column options"
                            >
                                <HiDotsVertical className="w-5 h-5 text-text-secondary" />
                            </button>
                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.15, ease: 'easeOut' }}
                                        className="absolute right-0 top-full mt-2 w-48 bg-bg-card rounded-md shadow-lg z-20 border border-bg-secondary overflow-hidden"
                                    >
                                        <ul className="py-1" role="menu">
                                            <li role="none">
                                                <button 
                                                    onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary flex items-center gap-3 transition-colors"
                                                    role="menuitem"
                                                >
                                                    <HiPencil className="w-4 h-4"/> Edit name
                                                </button>
                                            </li>
                                            <li role="none">
                                                <button
                                                    onClick={() => { onDeleteBoard(column.id); setIsMenuOpen(false); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error hover:text-white flex items-center gap-3 transition-colors"
                                                    role="menuitem"
                                                >
                                                    <HiTrash className="w-4 h-4"/> Delete column
                                                </button>
                                            </li>
                                        </ul>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="flex-grow space-y-3 overflow-y-auto pr-1">
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
            
            <div className="mt-3">
              {!isDragging && (
                  <motion.button
                      onClick={() => onShowAddTaskModal(column.id)}
                      className="w-full text-left p-2 rounded-md text-text-secondary hover:bg-bg-card hover:text-accent-primary transition-colors"
                      whileTap={{ scale: 0.98 }}
                      aria-label={`Add a task to ${column.name}`}
                  >
                      + Add a task
                  </motion.button>
              )}
            </div>
        </motion.div>
    );
});

export default KanbanColumn;