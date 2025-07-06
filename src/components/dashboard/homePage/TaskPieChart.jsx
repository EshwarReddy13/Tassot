import { motion } from 'framer-motion';

const TaskPieChart = ({ tasks }) => {
  // Calculate task status distribution
  const taskStats = tasks?.reduce((acc, task) => {
    const status = task.status || 'To Do';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}) || {};

  const totalTasks = Object.values(taskStats).reduce((sum, count) => sum + count, 0);
  
  // Define colors for different statuses
  const statusColors = {
    'Done': '#10B981', // green
    'In Progress': '#3B82F6', // blue
    'To Do': '#6B7280', // gray
    'Review': '#F59E0B', // yellow
    'Blocked': '#EF4444', // red
  };

  // Create pie chart segments
  const segments = Object.entries(taskStats).map(([status, count]) => {
    const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
    const color = statusColors[status] || '#6B7280';
    return { status, count, percentage, color };
  });

  // Sort by count (descending)
  segments.sort((a, b) => b.count - a.count);

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📊</span>
        <h2 className="text-text-primary text-xl font-bold">Task Status</h2>
        {totalTasks > 0 && (
          <span className="bg-accent-primary/20 text-accent-primary text-xs px-2 py-1 rounded-full font-medium">
            {totalTasks}
          </span>
        )}
      </div>

      {totalTasks === 0 ? (
        <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
          <div className="text-text-tertiary text-6xl mb-4">📊</div>
          <p className="text-text-secondary mb-2">No tasks yet</p>
          <p className="text-text-tertiary text-sm">Your task status will appear here</p>
        </div>
      ) : (
        <div className="flex-1 flex items-center">
          {/* Left Side: Pie Chart */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {segments.map((segment, index) => {
                  const previousSegments = segments.slice(0, index);
                  const startAngle = previousSegments.reduce((sum, seg) => sum + (seg.percentage / 100) * 360, 0);
                  const endAngle = startAngle + (segment.percentage / 100) * 360;
                  
                  const startRadians = (startAngle * Math.PI) / 180;
                  const endRadians = (endAngle * Math.PI) / 180;
                  
                  const x1 = 50 + 40 * Math.cos(startRadians);
                  const y1 = 50 + 40 * Math.sin(startRadians);
                  const x2 = 50 + 40 * Math.cos(endRadians);
                  const y2 = 50 + 40 * Math.sin(endRadians);
                  
                  const largeArcFlag = segment.percentage > 50 ? 1 : 0;
                  
                  return (
                    <path
                      key={segment.status}
                      d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill={segment.color}
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-text-primary text-3xl font-bold">{totalTasks}</div>
                  <div className="text-text-secondary text-sm">Total</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Legend and Details */}
          <div className="flex-1 pl-6">
            <div className="space-y-3">
              {segments.map((segment) => (
                <motion.div
                  key={segment.status}
                  className="flex items-center justify-between p-3 rounded-lg glass-hover transition-colors"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    ></div>
                    <div>
                      <span className="text-text-primary text-sm font-medium capitalize">
                        {segment.status}
                      </span>
                      <div className="text-text-tertiary text-xs">
                        {segment.percentage.toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-text-primary font-bold text-lg">
                      {segment.count}
                    </span>
                    <div className="text-text-tertiary text-xs">
                      tasks
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskPieChart; 