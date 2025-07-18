import { memo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard.jsx';
import clsx from 'clsx';
import { HiDotsVertical, HiPencil, HiTrash, HiSparkles, HiPlus, HiCheck, HiColorSwatch } from 'react-icons/hi';
import BoardColorPickerModal from './BoardColorPickerModal.jsx'; // <-- IMPORT NEW MODAL

const NEON_COLORS = [
    '#FF3B30', '#FF9500', '#FFCC00', '#34C759', 
    '#5AC8FA', '#007AFF', '#5856D6', '#AF52DE'
];

const KanbanColumn = memo(({ 
    column, 
    tasks, 
    onTaskClick, 
    isDragging,
    onDeleteTask,
    onUpdateTaskName,
    currentUserRole,
    onDeleteBoard,
    onUpdateBoardName,
    onUpdateBoardColor, // <-- NEW PROP
    onShowAddTaskModal,
    onShowAITaskModal,
    uniformHeight
}) => {
    const { setNodeRef, isOver } = useDroppable({ id: column.id });

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isColorModalOpen, setIsColorModalOpen] = useState(false); // <-- Renamed state
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

    const handleColorSelect = (color) => {
        if (color !== column.color) {
            onUpdateBoardColor(column.id, color);
        }
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
        <>
            <motion.div
                ref={setNodeRef}
                className={clsx(
                    'glass-column p-3 flex flex-col relative overflow-hidden',
                    { 
                        'ring-2 ring-accent-primary/50 shadow-accent-primary/20': isOver,
                    }
                )}
                style={{ 
                    height: uniformHeight ? `${uniformHeight}px` : 'auto',
                    minHeight: '50vh'
                }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
            >
                {/* Column Header - Sticky */}
                <div className={clsx("flex justify-between items-center mb-2 flex-shrink-0 sticky top-0 z-10 ", { 'pointer-events-none': isDragging })}>
                    <div className="flex-grow p-2">
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
                            <h3 className="text-white font-semibold text-sm uppercase flex items-center" >
                                {column.name.toLowerCase() === 'done' ? (
                                    <HiCheck className="w-4 h-4 mr-2" style={{ color: column.color }} />
                                ) : (
                                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: column.color }} />
                                )}
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
                                                        onClick={() => { setIsColorModalOpen(true); setIsMenuOpen(false); }}
                                                        className="w-full text-left px-4 py-3 text-sm text-text-primary hover:bg-white/10 flex items-center gap-3 transition-all duration-200"
                                                        whileHover={{ x: 5 }}
                                                        role="menuitem"
                                                    >
                                                        <HiColorSwatch className="w-4 h-4 text-teal-400"/> 
                                                        <span>Edit color</span>
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
                    <div className="flex-grow space-y-1.5 pt-2">
                        <AnimatePresence>
                            {tasks.map((task) => (
                                <TaskCard 
                                    key={task.id} 
                                    task={task}
                                    boardColor={column.color}
                                    isDoneColumn={column.name.toLowerCase() === 'done'}
                                    onTaskClick={onTaskClick} 
                                    isGlobalDragging={isDragging} 
                                    onDelete={onDeleteTask} 
                                    onUpdateName={onUpdateTaskName}
                                    // We no longer pass permission flags down to TaskCard
                                />
                            ))}
                        </AnimatePresence>
                        
                        {/* Add Task Buttons - Now positioned right after tasks */}
                        {!isDragging && canManageBoards && (
                            <div className="space-y-1.5 pt-2">
                                <motion.button
                                    onClick={() => onShowAddTaskModal(column.id)}
                                    className="w-full text-left p-3 hover-gradient hover:rounded-lg transition-all duration-200 text-text-secondary hover:text-accent-primary"
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    aria-label={`Add a task to ${column.name}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg flex items-center justify-center">
                                            <HiPlus className="w-4 h-4 text-purple-300" />
                                        </div>
                                        <span className="font-medium">Create task</span>
                                    </div>
                                </motion.button>
                                
                                <motion.button
                                    onClick={() => onShowAITaskModal(column.id)}
                                    className="w-full text-left p-3 hover-gradient hover:rounded-lg transition-all duration-200 text-text-secondary hover:text-accent-primary"
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    aria-label={`Create task with AI in ${column.name}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg flex items-center justify-center">
                                            <HiSparkles className="w-4 h-4 text-purple-300" />
                                        </div>
                                        <span className="font-medium">Create with AI</span>
                                    </div>
                                </motion.button>
                            </div>
                        )}
                    </div>
                </SortableContext>

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
            <BoardColorPickerModal 
                isOpen={isColorModalOpen}
                onClose={() => setIsColorModalOpen(false)}
                onColorSelect={handleColorSelect}
                currentColor={column.color}
            />
        </>
    );
});

export default KanbanColumn;