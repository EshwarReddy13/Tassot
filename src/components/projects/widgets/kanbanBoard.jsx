import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './taskCard.jsx';
import { AddColumnForm, AddTaskForm } from './popups.jsx';

const KanbanColumn = memo(({ column, children, tasks }) => {
  return (
    <motion.div
      className="bg-bg-secondary rounded-lg p-4 min-h-[25rem] w-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="region"
      aria-label={`${column.name} column`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold" style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>
          {column.name}
        </h3>
        <span className="text-sm font-medium text-text-secondary bg-bg-primary px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-grow space-y-3 overflow-y-auto pr-1">
          <AnimatePresence>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onTaskClick={() => {}} />
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
      {children}
    </motion.div>
  );
});

const KanbanBoard = ({
  columns,
  tasks,
  newColumn, // Keep this as a single object prop
  // Task adding props
  addingTask,
  onShowAddTaskForm,
  onCancelAddTask,
  onAddTask,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event) => {
    // Drag and drop logic will be implemented later
    console.log('Drag ended:', event);
  };

  const columnsToRender = [...columns, { id: 'add-column-placeholder' }];

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <section aria-label="Kanban board">
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))' }}>
          {columnsToRender.map((column) => {
            if (column.id === 'add-column-placeholder') {
              return (
                <div key="add-column" className="min-h-[25rem]">
                  {/* FIX: Use the properties from the 'newColumn' object prop */}
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
              <KanbanColumn key={column.id} column={column} tasks={columnTasks}>
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
    </DndContext>
  );
};

export default KanbanBoard;