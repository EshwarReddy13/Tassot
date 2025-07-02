import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from './ProjectCard.jsx';

const SortableProjectCard = ({ project, index, onEdit, onDelete, onPinToggle, onNavigate, isPinning, isGlobalDragging }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    over,
  } = useSortable({ 
    id: project.id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1, 
        scale: isDragging ? 1.05 : 1,
        zIndex: isDragging ? 1000 : 'auto'
      }}
      transition={{ 
        duration: 0.2,
        ease: "easeInOut"
      }}
      className={`relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      <ProjectCard
        project={project}
        index={index}
        onEdit={onEdit}
        onDelete={onDelete}
        onPinToggle={onPinToggle}
        onNavigate={onNavigate}
        isPinning={isPinning}
        isDragging={isDragging}
        isGlobalDragging={isGlobalDragging}
      />
      
      {/* Drop zone indicators */}
      {over && !isDragging && (
        <motion.div
          className="absolute inset-0 border-2 border-dashed border-accent-primary/50 bg-accent-primary/5 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.div>
  );
};

const DraggableProjectGrid = ({ 
  projects, 
  onEdit, 
  onDelete, 
  onPinToggle, 
  onNavigate, 
  pinningProject,
  onReorder 
}) => {
  const [activeId, setActiveId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeProject = activeId ? projects.find(project => project.id === activeId) : null;

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    setIsDragging(true);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    // Always reset the dragging state
    setActiveId(null);
    setIsDragging(false);

    // Only reorder if we dropped on a valid target
    if (active.id !== over?.id && over) {
      const oldIndex = projects.findIndex(project => project.id === active.id);
      const newIndex = projects.findIndex(project => project.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(projects, oldIndex, newIndex);
        
        // Create the project orders array for the API
        const projectOrders = newOrder.map((project, index) => ({
          projectUrl: project.projectUrl ?? project.project_url,
          sortOrder: index
        }));
        
        onReorder(projectOrders);
      }
    }
  };

  const handleDragCancel = () => {
    // Ensure we always reset the state when drag is cancelled
    setActiveId(null);
    setIsDragging(false);
  };

  const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
    >
      <SortableContext 
        items={projects.map(p => p.id)} 
        strategy={rectSortingStrategy}
      >
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          layout
        >
          <AnimatePresence>
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
              >
                <SortableProjectCard
                  project={project}
                  index={index}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onPinToggle={onPinToggle}
                  onNavigate={onNavigate}
                  isPinning={pinningProject === (project.projectUrl ?? project.project_url)}
                  isGlobalDragging={isDragging}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </SortableContext>

      {/* Drag Overlay */}
      <DragOverlay 
        dropAnimation={dropAnimationConfig}
        modifiers={[]}
      >
        {activeProject ? (
          <motion.div
            initial={{ scale: 1, rotate: 0 }}
            animate={{ 
              scale: 1.05, 
              rotate: 2,
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            }}
            transition={{ duration: 0.2 }}
            className="transform-gpu"
          >
            <ProjectCard
              project={activeProject}
              index={0}
              onEdit={onEdit}
              onDelete={onDelete}
              onPinToggle={onPinToggle}
              onNavigate={onNavigate}
              isPinning={pinningProject === (activeProject.projectUrl ?? activeProject.project_url)}
              isDragging={true}
              isGlobalDragging={isDragging}
            />
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DraggableProjectGrid; 