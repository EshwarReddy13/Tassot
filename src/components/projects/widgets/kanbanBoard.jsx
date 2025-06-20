import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import TaskCard from './taskCard.jsx';
import KanbanColumn from './kanbanColumn.jsx';
import { HiX } from 'react-icons/hi';

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
      <motion.button
        onClick={onAddColumnClick}
        className="w-full h-full flex items-center justify-center p-4 rounded-lg text-text-secondary hover:bg-bg-card hover:text-accent-primary transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        aria-label="Add a new column"
      >
        <span className="font-semibold text-lg">+ Add New Column</span>
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="w-full"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={formVariants}
      >
        <div className="bg-bg-card p-3 rounded-lg shadow-md w-full">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={onColumnNameChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter column name..."
            className="w-full bg-bg-primary text-text-primary placeholder-text-placeholder p-2 rounded-md border-2 border-transparent focus:border-accent-primary focus:outline-none"
            aria-label="New column name"
          />
          {error && (
            <p className="text-error text-sm mt-2 px-1">{error}</p>
          )}
          <div className="flex items-center justify-start space-x-2 mt-3">
            <button
              onClick={onAddColumn}
              className="px-4 py-2 bg-accent-primary text-text-primary font-semibold rounded-md hover:bg-accent-hover transition-colors duration-200"
              aria-label="Save new column"
            >
              Save
            </button>
            <button
              onClick={onCancelAddColumn}
              className="p-2 text-text-secondary hover:text-text-primary rounded-full"
              aria-label="Cancel adding column"
            >
              <HiX className="w-5 h-5" />
            </button>
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
    activeTask,
    onDragStart,
    onDragEnd,
    isDragging,
    onDeleteTask,
    onUpdateTaskName,
    currentUserRole, // <-- This prop is received correctly from ProjectDetails
    onDeleteBoard,
    onUpdateBoardName,
}) => {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    );

    const columnsToRender = [...columns, { id: 'add-column-placeholder' }];

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            <section aria-label="Kanban board">
                <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))' }}>
                    {columnsToRender.map((column) => {
                        if (column.id === 'add-column-placeholder') {
                            const canAddColumn = currentUserRole === 'owner' || currentUserRole === 'editor';
                            return canAddColumn ? (
                                <div key="add-column" className="min-h-[25rem]">
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
                                </div>
                            ) : null;
                        }

                        const columnTasks = tasks.filter(task => task.board_id === column.id);

                        return (
                            <KanbanColumn
                                key={column.id}
                                column={column}
                                tasks={columnTasks}
                                onTaskClick={onTaskClick}
                                isDragging={isDragging}
                                onDeleteTask={onDeleteTask}
                                onUpdateTaskName={onUpdateTaskName}
                                currentUserRole={currentUserRole}
                                onDeleteBoard={onDeleteBoard}
                                onUpdateBoardName={onUpdateBoardName}
                                onShowAddTaskModal={onShowAddTaskModal}
                            />
                        );
                    })}
                </div>
            </section>

            {createPortal(
                <DragOverlay>
                    {activeTask ? <TaskCard task={activeTask} isOverlay={true} /> : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
};

export default KanbanBoard;