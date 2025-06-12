import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import TaskCard from './taskCard.jsx';
import KanbanColumn from './KanbanColumn.jsx';
import { AddColumnForm, AddTaskForm } from './popups.jsx';

const KanbanBoard = ({
  columns,
  tasks,
  onTaskClick,
  newColumn,
  addingTask,
  onShowAddTaskForm,
  onCancelAddTask,
  onAddTask,
  activeTask,
  onDragStart,
  onDragEnd,
  isDragging,
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
              return (
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
              );
            }

            const columnTasks = tasks.filter(task => task.board_id === column.id);

            return (
              <KanbanColumn key={column.id} column={column} tasks={columnTasks} onTaskClick={onTaskClick} isDragging={isDragging}>
                <div className="mt-3">
                  <AnimatePresence>
                    {addingTask.boardId === column.id && (
                      <AddTaskForm
                        taskName={addingTask.name}
                        onTaskNameChange={(e) => onAddTask.handleNameChange(e.target.value)}
                        onSave={onAddTask.handleSave}
                        onCancel={onCancelAddTask}
                        inputRef={onAddTask.inputRef}
                        error={addingTask.error}
                      />
                    )}
                  </AnimatePresence>

                  {addingTask.boardId !== column.id && (
                    <motion.button
                      onClick={() => onShowAddTaskForm(column.id)}
                      className="w-full text-left p-2 rounded-md text-text-secondary hover:bg-bg-card hover:text-accent-primary transition-colors duration-200"
                      whileTap={{ scale: 0.98 }}
                      aria-label={`Add a task to ${column.name}`}
                    >
                      + Add a task
                    </motion.button>
                  )}
                </div>
              </KanbanColumn>
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