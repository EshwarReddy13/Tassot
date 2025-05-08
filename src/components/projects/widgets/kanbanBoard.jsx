import { motion } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './taskCard.jsx';
import { AddColumnForm } from './popups.jsx';

const KanbanBoard = ({
  columns,
  tasks,
  newColumn,
  onAddColumnClick,
  onColumnNameChange,
  onAddColumn,
  onCancelAddColumn,
  onEditColumnClick,
  onAddTaskClick,
  onTaskClick,
  inputRef,
  updateTask,
  projectId,
  setTasks,
}) => {
  const taskVariants = {
    initial: { opacity: 0, y: 10 },
    animate: (taskIndex) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    }),
    exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // Require 5px movement to start drag
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeTask = tasks.find((task) => task.taskId === active.id);
    const overTask = tasks.find((task) => task.taskId === over.id);
    const activeColumnId = columns.find((col) => col.title === activeTask.status)?.id;
    const overColumnId = overTask
      ? columns.find((col) => col.title === overTask.status)?.id
      : columns.find((col) => col.id === active.data.current?.sortable.containerId)?.id;

    // Prevent dragging to 'add-column'
    if (overColumnId === 'add-column') {
      return;
    }

    const destColumn = columns.find((col) => col.id === overColumnId);
    const newTasks = Array.from(tasks);
    const [movedTask] = newTasks.splice(tasks.indexOf(activeTask), 1);
    const destIndex = overTask
      ? newTasks.findIndex((task) => task.taskId === overTask.taskId)
      : newTasks.filter((task) => task.status === destColumn.title).length;

    newTasks.splice(destIndex, 0, { ...movedTask, status: destColumn.title });

    // Update state optimistically
    setTasks(newTasks);

    // Update task status in Firestore
    try {
      await updateTask(projectId, movedTask.taskId, { status: destColumn.title });
      console.log('Task status updated:', { taskId: movedTask.taskId, newStatus: destColumn.title });
    } catch (err) {
      console.error('Failed to update task status:', err);
      // Revert state on error
      setTasks(tasks);
    }
  };

  const DroppableColumn = ({ column, columnIndex, children }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: column.id,
      disabled: column.id === 'add-column',
    });

    return (
      <motion.div
        ref={setNodeRef}
        key={column.id}
        className={`bg-bg-secondary rounded-lg p-4 min-h-[20rem] transition-all duration-200 ${
          isOver && column.id !== 'add-column' ? 'border-2 border-accent-primary bg-bg-card' : ''
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: columnIndex * 0.1 }}
        role="region"
        aria-label={`${column.title} column`}
      >
        {children}
      </motion.div>
    );
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <section aria-label="Kanban board">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
            maxWidth: '100%',
            margin: '0 auto',
          }}
        >
          {columns.map((column, columnIndex) => (
            <DroppableColumn column={column} columnIndex={columnIndex}>
              {column.id === 'add-column' ? (
                <AddColumnForm
                  isAdding={newColumn.isAdding}
                  name={newColumn.name}
                  error={newColumn.error}
                  onAddColumnClick={onAddColumnClick}
                  onColumnNameChange={onColumnNameChange}
                  onAddColumn={onAddColumn}
                  onCancelAddColumn={onCancelAddColumn}
                  inputRef={inputRef}
                />
              ) : (
                <SortableContext
                  id={column.id}
                  items={tasks.filter((task) => task.status === column.title).map((task) => task.taskId)}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    className="transition-all duration-200"
                    style={{ minHeight: '10rem' }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3
                        className="text-text-primary font-semibold text-left"
                        style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
                      >
                        {column.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-text-secondary text-sm">
                          {tasks.filter((task) => task.status === column.title).length} tasks
                        </span>
                        <motion.button
                          className="text-text-primary hover:text-accent-primary"
                          onClick={() => onEditColumnClick(column)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={`Edit ${column.title} column`}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {tasks
                        .filter((task) => task.status === column.title)
                        .map((task, taskIndex) => (
                          <TaskCard
                            key={task.taskId}
                            task={task}
                            taskIndex={taskIndex}
                            columnIndex={columnIndex}
                            taskVariants={taskVariants}
                            onTaskClick={onTaskClick}
                          />
                        ))}
                      <motion.div
                        key={`add-task-${column.id}`}
                        className="bg-bg-card text-center p-2 rounded-lg text-text-primary cursor-pointer hover:border-2 hover:border-accent-primary"
                        variants={taskVariants}
                        initial="initial"
                        animate="animate"
                        custom={tasks.filter((task) => task.status === column.title).length}
                        transition={{
                          duration: 0.3,
                          delay: (columnIndex + 1) * 0.3 + tasks.filter((task) => task.status === column.title).length * 0.1,
                        }}
                        onClick={() => onAddTaskClick(column)}
                        role="button"
                        aria-label={`Add new task to ${column.title}`}
                      >
                        <p className="font-medium text-accent-primary">Add a New Task +</p>
                      </motion.div>
                    </div>
                  </div>
                </SortableContext>
              )}
            </DroppableColumn>
          ))}
        </div>
      </section>
    </DndContext>
  );
};

export default KanbanBoard;