import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import TaskCard from './taskCard.jsx';
import KanbanColumn from './kanbanColumn.jsx';
import { AddColumnForm } from './popups.jsx';

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
                                // --- THIS IS THE FIX ---
                                // The `currentUserRole` prop is now correctly passed down to each KanbanColumn
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