import { motion } from 'framer-motion';

const ActivityItem = ({ activity }) => {
  const getActivityIcon = (actionType) => {
    switch (actionType) {
      case 'task_created': return '📝';
      case 'task_completed': return '✅';
      case 'comment_added': return '💬';
      case 'project_updated': return '🔄';
      case 'member_joined': return '👤';
      case 'task_assigned': return '📋';
      default: return '📌';
    }
  };

  const getActivityColor = (actionType) => {
    switch (actionType) {
      case 'task_created': return 'bg-blue-500/20 text-blue-400';
      case 'task_completed': return 'bg-green-500/20 text-green-400';
      case 'comment_added': return 'bg-purple-500/20 text-purple-400';
      case 'project_updated': return 'bg-orange-500/20 text-orange-400';
      case 'member_joined': return 'bg-cyan-500/20 text-cyan-400';
      case 'task_assigned': return 'bg-indigo-500/20 text-indigo-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now - activityTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return activityTime.toLocaleDateString();
  };

  return (
    <motion.div
      className="flex items-start gap-4 p-4 hover:bg-bg-secondary rounded-xl transition-colors group cursor-pointer"
      whileHover={{ x: 4 }}
    >
      <div className={`p-2 rounded-lg ${getActivityColor(activity.action_type)} text-lg`}>
        {getActivityIcon(activity.action_type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-sm leading-relaxed">
          <span className="font-medium text-accent-primary">
            {activity.user_name || activity.userName}
          </span>
          {' '}
          {activity.action_type === 'task_created' && `created task "${activity.task_name || activity.taskName}"`}
          {activity.action_type === 'task_completed' && `completed task "${activity.task_name || activity.taskName}"`}
          {activity.action_type === 'comment_added' && `added a comment to "${activity.task_name || activity.taskName}"`}
          {activity.action_type === 'project_updated' && `updated project "${activity.project_name || activity.projectName}"`}
          {activity.action_type === 'member_joined' && `joined project "${activity.project_name || activity.projectName}"`}
          {activity.action_type === 'task_assigned' && `was assigned to "${activity.task_name || activity.taskName}"`}
          {!['task_created', 'task_completed', 'comment_added', 'project_updated', 'member_joined', 'task_assigned'].includes(activity.action_type) && 
            `performed ${activity.action_type.replace('_', ' ')}`
          }
        </p>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-text-secondary text-xs font-mono">
            {activity.project_key || activity.projectKey}
          </span>
          <span className="text-text-tertiary text-xs">•</span>
          <span className="text-text-tertiary text-xs">
            {formatTimeAgo(activity.created_at || activity.createdAt)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const RecentActivity = ({ activities }) => {
  const recentActivities = activities?.slice(0, 8) || [];

  return (
    <div 
      className="border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)'
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <h2 className="text-text-primary text-xl font-bold">Recent Activity</h2>
          {recentActivities.length > 0 && (
            <span className="bg-accent-primary/20 text-accent-primary text-xs px-2 py-1 rounded-full font-medium">
              {recentActivities.length}
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

      {recentActivities.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-text-tertiary text-6xl mb-4">📊</div>
          <p className="text-text-secondary mb-2">No recent activity</p>
          <p className="text-text-tertiary text-sm">Activity across your projects will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recentActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ActivityItem activity={activity} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity; 