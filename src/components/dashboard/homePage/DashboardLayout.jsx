import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import DashboardStats from './DashboardStats.jsx';
import PinnedProjects from './PinnedProjects.jsx';
import TaskCalendar from './TaskCalendar.jsx';
import MyTasks from './MyTasks.jsx';
import TaskPieChart from './TaskPieChart.jsx';
import TaskDetailsModal from '../../projects/tasks/TaskDetails.jsx';
import RecentActivity from './RecentActivity.jsx';
import AITools from './AITools.jsx';

const DashboardLayout = ({ userData, projects, tasks, activities, dashboardStats, onCreateProject }) => {
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boards, setBoards] = useState([]);
  const [members, setMembers] = useState([]);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleUpdateTask = async (updatedTask) => {
    // TODO: Implement task update logic
    console.log('Task updated:', updatedTask);
  };
  return (
    <div className="min-h-screen p-6">
      <div className="max-w mx-auto space-y-8">
        {/* Row 1: Header with Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <DashboardStats userData={userData} projects={projects} tasks={tasks} dashboardStats={dashboardStats} />
        </motion.div>

        {/* Row 2: Two Equal Height Columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Left Column: Pinned Projects + Calendar */}
          <div className="h-full flex flex-col space-y-8">
            <div className="flex-1">
              <PinnedProjects projects={projects} onCreateProject={onCreateProject} onNavigate={handleNavigate} />
            </div>
            <div className="flex-1">
              <TaskCalendar tasks={tasks} onTaskClick={handleTaskClick} />
            </div>
          </div>

          {/* Right Column: Pie Chart + Tasks (split vertically) */}
          <div className="h-full flex flex-col space-y-8">
            <div className="flex-1">
              <TaskPieChart tasks={tasks} />
            </div>
            <div className="flex-1">
              <MyTasks tasks={tasks} />
            </div>
          </div>
        </motion.div>

        {/* Row 3: Activity and AI Tools (60/40 split) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-8"
        >
          {/* Left Column: Recent Activity (60%) */}
          <div className="lg:col-span-3">
            <RecentActivity activities={activities} />
          </div>

          {/* Right Column: AI Tools (40%) */}
          <div className="lg:col-span-2">
            <AITools />
          </div>
        </motion.div>
      </div>

      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={selectedTask}
        boards={boards}
        onUpdateTask={handleUpdateTask}
        creator={selectedTask?.created_by ? { id: selectedTask.created_by } : null}
        members={members}
      />
    </div>
  );
};

export default DashboardLayout; 