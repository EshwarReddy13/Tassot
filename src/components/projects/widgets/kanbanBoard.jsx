import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import TaskCard from './taskCard.jsx';
import KanbanColumn from './kanbanColumn.jsx';
import { AddColumnForm} from './popups.jsx';

const KanbanBoard = ({
    columns,
    tasks,
    onTaskClick,
    newColumn,
    // --- MODIFICATION: The following props are no longer needed and are removed ---
    // addingTask,
    // onShowAddTaskForm,
    // onCancelAddTask,
    // onAddTask,
    // --- [NEW] This single prop replaces them all ---
    onShowAddTaskModal,
    activeTask,
    onDragStart,
    onDragEnd,
    isDragging,
    onDeleteTask,
    onUpdateTaskName,
    isOwner,
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
                            <KanbanColumn
                                key={column.id}
                                column={column}
                                tasks={columnTasks}
                                onTaskClick={onTaskClick}
                                isDragging={isDragging}
                                onDeleteTask={onDeleteTask}
                                onUpdateTaskName={onUpdateTaskName}
                                isOwner={isOwner}
                                onDeleteBoard={onDeleteBoard}
                                onUpdateBoardName={onUpdateBoardName}
                                // --- [NEW] The prop to trigger the modal is passed down ---
                                onShowAddTaskModal={onShowAddTaskModal}
                            >
                                {/* 
                                    The `children` prop for KanbanColumn from your file was only used
                                    for the old inline form. As we are removing that logic, nothing needs
                                    to be rendered here anymore, so the block is removed. The "+ Add a task"
                                    button is now inside KanbanColumn itself.
                                */}
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