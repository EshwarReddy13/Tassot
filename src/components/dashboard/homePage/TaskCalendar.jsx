import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';

const TaskCalendar = ({ tasks, onTaskClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Get current month's calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendar = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      calendar.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return calendar;
  }, [currentDate]);

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  // Navigate to previous/next month
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Check if date is today
  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString();
  };

  // Check if date is in current month
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div 
      className="border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 h-full flex flex-col"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📅</span>
          <h2 className="text-text-primary text-xl font-bold">Calendar</h2>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img 
              src="https://api.iconify.design/mdi:chevron-left.svg?color=white" 
              alt="Previous"
              className="w-4 h-4"
            />
          </motion.button>
          <span className="text-text-primary font-medium min-w-[120px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <motion.button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img 
              src="https://api.iconify.design/mdi:chevron-right.svg?color=white" 
              alt="Next"
              className="w-4 h-4"
            />
          </motion.button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-text-secondary text-xs font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {calendarData.map((date, index) => {
            const dayTasks = getTasksForDate(date);
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDate = isToday(date);
            
            return (
              <motion.div
                key={index}
                className={`
                  relative min-h-[80px] p-1 rounded-lg border transition-all duration-200
                  ${isCurrentMonthDay 
                    ? 'bg-bg-primary border-white/10 hover:border-white/20' 
                    : 'bg-bg-secondary border-white/5'
                  }
                  ${isTodayDate 
                    ? 'bg-accent-primary/20 border-accent-primary/30' 
                    : 'hover:bg-bg-secondary/80'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.01 }}
              >
                {/* Date Number */}
                <div className={`
                  text-xs font-medium mb-1 pl-1
                  ${isCurrentMonthDay ? 'text-text-primary' : 'text-text-tertiary'}
                  ${isTodayDate ? 'text-accent-primary font-bold' : ''}
                `}>
                  {date.getDate()}
                </div>

                {/* Tasks */}
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task, taskIndex) => {
                    const isOverdue = new Date(task.deadline) < new Date();
                    const isCompleted = task.status === 'Done';
                    
                    return (
                      <motion.div
                        key={task.id}
                        className={`
                          text-xs px-1 py-0.5 rounded cursor-pointer transition-all duration-200
                          ${isCompleted 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : isOverdue 
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                              : 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                          }
                          hover:scale-105 hover:shadow-sm
                        `}
                        onClick={() => onTaskClick(task)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: taskIndex * 0.1 }}
                      >
                        {task.task_key || task.taskKey || 'TASK'}
                      </motion.div>
                    );
                  })}
                  
                  {/* Show more indicator */}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-text-tertiary text-center">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-accent-primary/20 border border-accent-primary/30"></div>
            <span className="text-text-secondary text-xs">Due</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30"></div>
            <span className="text-text-secondary text-xs">Overdue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30"></div>
            <span className="text-text-secondary text-xs">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCalendar; 