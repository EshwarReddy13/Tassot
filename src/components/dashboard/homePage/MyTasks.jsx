import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';

const TaskCard = ({ task, onNavigate }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return 'bg-green-500';
      case 'In Progress': return 'bg-blue-500';
      case 'To Do': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return date.toLocaleDateString();
  };

  const isOverdue = new Date(task.deadline) < new Date();

  return (
    <motion.div
      className="bg-bg-card border border-border-secondary rounded-xl p-4 hover:border-border-primary transition-all duration-300 hover:shadow-lg cursor-pointer group"
      whileHover={{ y: -2 }}
      onClick={() => onNavigate(`/projects/${task.projectUrl || task.project_url}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-text-primary font-semibold text-lg mb-1 group-hover:text-accent-primary transition-colors line-clamp-2">
            {task.task_name || task.taskName}
          </h3>
          <p className="text-text-secondary text-sm font-mono">
            {task.project_name || task.projectName} • {task.task_key || task.taskKey}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`}></div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            task.status === 'Done' ? 'bg-green-500/20 text-green-400' :
            task.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {task.status || 'To Do'}
          </span>
        </div>
        <span className={`text-xs font-medium ${
          isOverdue ? 'text-red-400' : 'text-text-tertiary'
        }`}>
          {formatDeadline(task.deadline)}
        </span>
      </div>
    </motion.div>
  );
};

const MyTasks = ({ tasks }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCustomFilters, setShowCustomFilters] = useState(false);
  const [customFilters, setCustomFilters] = useState({
    dateFrom: '',
    dateTo: '',
    project: ''
  });

  // Filter tasks based on active filter
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    let filtered = [...tasks];

    // Apply quick filters
    switch (activeFilter) {
      case 'overdue':
        filtered = filtered.filter(task => new Date(task.deadline) < new Date());
        break;
      case 'todo':
        filtered = filtered.filter(task => 
          task.status === 'To Do' || 
          !task.status
        );
        break;
      case 'completed':
        filtered = filtered.filter(task => task.status === 'Done');
        break;
      case 'in-progress':
        filtered = filtered.filter(task => task.status === 'In Progress');
        break;
      default:
        break;
    }

    // Apply custom filters
    if (customFilters.dateFrom) {
      filtered = filtered.filter(task => 
        new Date(task.deadline) >= new Date(customFilters.dateFrom)
      );
    }
    if (customFilters.dateTo) {
      filtered = filtered.filter(task => 
        new Date(task.deadline) <= new Date(customFilters.dateTo)
      );
    }
    // Remove priority filter since tasks don't have priority field
    if (customFilters.project) {
      filtered = filtered.filter(task => 
        task.project_name?.toLowerCase().includes(customFilters.project.toLowerCase()) ||
        task.projectName?.toLowerCase().includes(customFilters.project.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }, [tasks, activeFilter, customFilters]);

  const displayedTasks = filteredTasks.slice(0, 6);

  const quickFilters = [
    { key: 'all', label: 'All', count: tasks?.length || 0 },
    { key: 'overdue', label: 'Overdue', count: tasks?.filter(t => new Date(t.deadline) < new Date()).length || 0 },
    { key: 'todo', label: 'To-Do', count: tasks?.filter(t => 
      t.status === 'To Do' || 
      !t.status
    ).length || 0 },
    { key: 'completed', label: 'Completed', count: tasks?.filter(t => t.status === 'Done').length || 0 },
    { key: 'in-progress', label: 'In Progress', count: tasks?.filter(t => t.status === 'In Progress').length || 0 }
  ];

  const handleCustomFilterChange = (field, value) => {
    setCustomFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearCustomFilters = () => {
    setCustomFilters({
      dateFrom: '',
      dateTo: '',
      project: ''
    });
  };

  return (
    <div 
      className="border border-white/10 rounded-xl p-6 h-full hover:border-white/20 transition-all duration-300 flex flex-col"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)'
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📋</span>
          <h2 className="text-text-primary text-xl font-bold">My Tasks</h2>
          {displayedTasks.length > 0 && (
            <span className="bg-accent-primary/20 text-accent-primary text-xs px-2 py-1 rounded-full font-medium">
              {displayedTasks.length}
            </span>
          )}
        </div>
        <motion.button
          className="text-accent-primary hover:text-accent-hover text-sm font-medium transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View All
        </motion.button>
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        {quickFilters.map((filter) => (
          <motion.button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200
              ${activeFilter === filter.key
                ? 'bg-accent-primary text-white'
                : 'bg-white/10 text-text-secondary hover:bg-white/20'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {filter.label}
            <span className="ml-1 opacity-70">({filter.count})</span>
          </motion.button>
        ))}
        
        {/* Custom Filters Button */}
        <motion.button
          onClick={() => setShowCustomFilters(!showCustomFilters)}
          className={`
            px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200
            ${showCustomFilters
              ? 'bg-accent-primary text-white'
              : 'bg-white/10 text-text-secondary hover:bg-white/20'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Filters
        </motion.button>
      </div>

      {/* Custom Filters Panel */}
      {showCustomFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10"
        >
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-text-secondary text-xs mb-1">From Date</label>
              <input
                type="date"
                value={customFilters.dateFrom}
                onChange={(e) => handleCustomFilterChange('dateFrom', e.target.value)}
                className="w-full bg-white/10 text-text-primary p-2 rounded-md border border-white/20 focus:border-accent-primary focus:outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-xs mb-1">To Date</label>
              <input
                type="date"
                value={customFilters.dateTo}
                onChange={(e) => handleCustomFilterChange('dateTo', e.target.value)}
                className="w-full bg-white/10 text-text-primary p-2 rounded-md border border-white/20 focus:border-accent-primary focus:outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-xs mb-1">Project</label>
              <input
                type="text"
                placeholder="Search projects..."
                value={customFilters.project}
                onChange={(e) => handleCustomFilterChange('project', e.target.value)}
                className="w-full bg-white/10 text-text-primary p-2 rounded-md border border-white/20 focus:border-accent-primary focus:outline-none text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <motion.button
              onClick={clearCustomFilters}
              className="text-text-secondary hover:text-text-primary text-xs transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear Filters
            </motion.button>
          </div>
        </motion.div>
      )}

      {displayedTasks.length === 0 ? (
        <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
          <div className="text-text-tertiary text-6xl mb-4">📋</div>
          <p className="text-text-secondary mb-2">
            {activeFilter === 'all' ? 'No tasks assigned' : `No ${activeFilter} tasks`}
          </p>
          <p className="text-text-tertiary text-sm">
            {activeFilter === 'all' 
              ? 'Tasks assigned to you will appear here' 
              : 'Try adjusting your filters'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {displayedTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <TaskCard task={task} onNavigate={() => {}} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasks; 