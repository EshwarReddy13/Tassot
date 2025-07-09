import { motion } from 'framer-motion';

const TimelineView = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 min-h-[60vh] flex flex-col items-center justify-center text-center"
    >
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 bg-gradient-to-br from-accent-primary/20 to-accent-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <svg className="w-10 h-10 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-text-primary mb-3">Timeline View</h2>
        <p className="text-text-secondary text-lg mb-6">
          Visualize your project progress over time with a comprehensive timeline view.
        </p>
        
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-3">Coming Soon</h3>
          <p className="text-text-secondary text-sm">
            The timeline view will show task dependencies, milestones, and project progress in a chronological format.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineView; 