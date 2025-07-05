import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color, trend }) => (
  <motion.div
    className="bg-bg-card/50 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-accent-primary/10"
    whileHover={{ y: -2 }}
    style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
    }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-text-secondary text-sm font-medium mb-1">{title}</p>
        <p className="text-text-primary text-3xl font-bold">{value}</p>
        {trend !== undefined && trend !== null && (
          <p className={`text-sm mt-1 ${trend > 0 ? 'text-success' : trend < 0 ? 'text-error' : 'text-text-secondary'}`}>
            {trend > 0 ? '+' : ''}{trend}% from last week
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color} backdrop-blur-sm`}>
        <img src={icon} alt="" className="w-6 h-6" />
      </div>
    </div>
  </motion.div>
);

const DashboardStats = ({ userData, projects, tasks, dashboardStats }) => {
  // Use real stats from backend if available, otherwise calculate from local data
  const stats = [
    {
      title: 'Total Projects',
      value: dashboardStats?.totalProjects?.current ?? (projects?.length || 0),
      icon: 'https://api.iconify.design/mdi:folder-multiple.svg?color=white',
      color: 'bg-blue-500/20',
      trend: dashboardStats?.totalProjects?.change
    },
    {
      title: 'Overdue Tasks',
      value: dashboardStats?.overdueTasks?.current ?? (() => {
        const now = new Date();
        return tasks?.filter(t => {
          if (!t.deadline) return false;
          const deadline = new Date(t.deadline);
          return deadline < now && t.status !== 'completed';
        })?.length || 0;
      })(),
      icon: 'https://api.iconify.design/mdi:alert-circle.svg?color=white',
      color: 'bg-red-500/20',
      trend: dashboardStats?.overdueTasks?.change
    },
    {
      title: 'Tasks Due Soon',
      value: dashboardStats?.tasksDueSoon?.current ?? (() => {
        const now = new Date();
        return tasks?.filter(t => {
          if (!t.deadline) return false;
          const deadline = new Date(t.deadline);
          const diffDays = (deadline - now) / (1000 * 60 * 60 * 24);
          return diffDays <= 7 && diffDays >= 0 && t.status !== 'completed';
        })?.length || 0;
      })(),
      icon: 'https://api.iconify.design/mdi:clock-alert.svg?color=white',
      color: 'bg-orange-500/20',
      trend: dashboardStats?.tasksDueSoon?.change
    },
    {
      title: 'Completed Tasks',
      value: dashboardStats?.completedTasks?.current ?? (() => {
        return tasks?.filter(t => {
          return t.status && t.status.toLowerCase() === 'completed';
        })?.length || 0;
      })(),
      icon: 'https://api.iconify.design/mdi:check-circle.svg?color=white',
      color: 'bg-purple-500/20',
      trend: dashboardStats?.completedTasks?.change
    }
  ];

  return (
    <div>
      {/* Minimal Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-text-primary text-3xl font-bold">Home</h1>
            <div className="w-12 h-0.5 bg-accent-primary mt-1 rounded-full ml-6"></div>
          </div>
          <div className="text-text-secondary text-sm">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects, tasks..."
              className="bg-bg-card/50 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2 pl-10 text-text-primary text-sm placeholder-text-secondary focus:outline-none focus:border-white/20 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)'
              }}
            />
            <img 
              src="https://api.iconify.design/mdi:magnify.svg?color=white" 
              alt="Search"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary"
            />
          </div>
          
          {/* Help Icon */}
          <motion.button
            className="p-2 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)'
            }}
          >
            <img 
              src="https://api.iconify.design/mdi:help-circle-outline.svg?color=white" 
              alt="Help"
              className="w-5 h-5 text-text-secondary hover:text-text-primary transition-colors"
            />
          </motion.button>
        
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats; 