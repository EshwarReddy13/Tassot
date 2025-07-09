import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { useEffect, useRef, useState } from 'react';
import TaskCard from './TaskCard.jsx';
import KanbanColumn from './KanbanColumn.jsx';
import { HiX, HiPlus } from 'react-icons/hi';

const AddColumnForm = ({
  isAdding,
  name,
  error,
  onAddColumnClick,
  onColumnNameChange,
  onAddColumn,
  onCancelAddColumn,
  inputRef,
}) => {
  const formVariants = {
    hidden: { opacity: 0, height: 0, y: -10 },
    visible: { opacity: 1, height: 'auto', y: 0, transition: { duration: 0.3 } },
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddColumn();
    }
    if (e.key === 'Escape') {
      onCancelAddColumn();
    }
  };

  if (!isAdding) {
    return (
      <motion.div
        className="h-auto glass-column p-3 flex flex-col relative overflow-hidden"
        style={{ minHeight: '20rem' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        whileHover={{ scale: 1.02, y: -2 }}
      >
        <motion.button
          onClick={onAddColumnClick}
          className="w-full h-full flex flex-col items-center justify-center p-6 text-text-secondary hover:text-accent-primary transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent group"
          aria-label="Add a new column"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-accent-primary/20 to-accent-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <HiPlus className="w-8 h-8 text-accent-primary" />
          </div>
          <span className="font-semibold text-lg">Add New Column</span>
          <span className="text-sm text-text-placeholder mt-1">Create a new status column</span>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="w-full glass-add-column-form"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={formVariants}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-primary/20 to-accent-primary/10 rounded-xl flex items-center justify-center">
              <HiPlus className="w-5 h-5 text-accent-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">New Column</h3>
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={onColumnNameChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter column name..."
            className="w-full glass-input text-text-primary placeholder-text-placeholder p-3 rounded-xl focus:border-accent-primary/50 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200"
            aria-label="New column name"
          />
          
          {error && (
            <motion.p 
              className="text-red-400 text-sm mt-3 px-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.p>
          )}
          
          <div className="flex items-center justify-start gap-3 mt-6">
            <motion.button
              onClick={onAddColumn}
              className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-primary/80 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 backdrop-blur-sm"
              whileTap={{ scale: 0.95 }}
              aria-label="Save new column"
            >
              Create Column
            </motion.button>
            <motion.button
              onClick={onCancelAddColumn}
              className="p-3 text-text-secondary hover:text-text-primary hover:bg-white/10 rounded-xl transition-all duration-200"
              whileTap={{ scale: 0.95 }}
              aria-label="Cancel adding column"
            >
              <HiX className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const KanbanBoard = ({
    columns,
    tasks,
    onTaskClick,
    newColumn,
    onShowAddTaskModal,
    onShowAITaskModal,
    activeTask,
    onDragStart,
    onDragEnd,
    isDragging,
    onDeleteTask,
    onUpdateTaskName,
    currentUserRole,
    onDeleteBoard,
    onUpdateBoardName,
    onUpdateBoardColor,
}) => {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    );

    const columnsToRender = [...columns, { id: 'add-column-placeholder' }];
    
    // Refs for measuring column heights
    const columnRefs = useRef({});
    const [uniformHeight, setUniformHeight] = useState(null);

    // Calculate uniform height for all columns
    useEffect(() => {
        const calculateUniformHeight = () => {
            const heights = Object.values(columnRefs.current)
                .filter(ref => ref && ref.offsetHeight)
                .map(ref => ref.offsetHeight);
            
            if (heights.length > 0) {
                const maxHeight = Math.max(...heights);
                // Add some buffer for smooth interactions
                setUniformHeight(maxHeight + 20);
            }
        };

        // Calculate after render
        const timer = setTimeout(calculateUniformHeight, 100);
        
        // Recalculate on window resize
        const handleResize = () => {
            setTimeout(calculateUniformHeight, 100);
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, [columns, tasks, newColumn.isAdding]);

    return (
        <motion.div
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="relative z-20">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                >
                    <section aria-label="Kanban board">
                        <motion.div 
                            className="flex gap-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            {columnsToRender.map((column, index) => {
                                if (column.id === 'add-column-placeholder') {
                                    const canAddColumn = currentUserRole === 'owner' || currentUserRole === 'editor';
                                    return canAddColumn ? (
                                        <>
                                            <motion.div 
                                                key="add-column"
                                                className="flex-shrink-0"
                                                style={{ 
                                                    width: '17rem',
                                                    height: uniformHeight ? `${uniformHeight}px` : 'auto'
                                                }}
                                                initial={{ opacity: 0, x: 30 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                            >
                                                <AddColumnForm
                                                    isAdding={newColumn.isAdding}
                                                    name={newColumn.name}
                                                    error={newColumn.error}
                                                    onAddColumnClick={newColumn.onAddColumnClick}
                                                    onColumnNameChange={newColumn.onColumnNameChange}
                                                    onAddColumn={newColumn.onAddColumn}
                                                    onCancelAddColumn={newColumn.onCancelAddColumn}
                                                    inputRef={newColumn.addColumnInputRef}
                                                />
                                            </motion.div>
                                            {/* Add margin after the add column */}
                                            <div className="flex-shrink-0 w-4"></div>
                                        </>
                                    ) : null;
                                }

                                const columnTasks = tasks.filter(task => task.board_id === column.id);

                                return (
                                    <motion.div
                                        key={column.id}
                                        className="flex-shrink-0"
                                        style={{ 
                                            width: '17rem',
                                            height: uniformHeight ? `${uniformHeight}px` : 'auto'
                                        }}
                                        initial={{ opacity: 0, x: 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        ref={(el) => {
                                            if (el) {
                                                columnRefs.current[column.id] = el;
                                            }
                                        }}
                                    >
                                        <KanbanColumn
                                            column={column}
                                            tasks={columnTasks}
                                            onTaskClick={onTaskClick}
                                            isDragging={isDragging}
                                            onDeleteTask={onDeleteTask}
                                            onUpdateTaskName={onUpdateTaskName}
                                            currentUserRole={currentUserRole}
                                            onDeleteBoard={onDeleteBoard}
                                            onUpdateBoardName={onUpdateBoardName}
                                            onUpdateBoardColor={onUpdateBoardColor}
                                            onShowAddTaskModal={onShowAddTaskModal}
                                            onShowAITaskModal={onShowAITaskModal}
                                            uniformHeight={uniformHeight}
                                        />
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </section>

                    {createPortal(
                        <DragOverlay>
                            {activeTask ? <TaskCard task={activeTask} isOverlay={true} /> : null}
                        </DragOverlay>,
                        document.body 
                    )}
                </DndContext>
            </div>
        </motion.div>
    );
};

export default KanbanBoard;