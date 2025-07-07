import { motion } from 'framer-motion';

const AllWorkView = () => {
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-text-primary mb-3">All Work</h2>
        <p className="text-text-secondary text-lg mb-6">
          Get a comprehensive overview of all work items across different project areas and team members.
        </p>
        
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-3">Coming Soon</h3>
          <p className="text-text-secondary text-sm">
            The all work view will aggregate tasks, documents, meetings, and other work items into a unified dashboard for project oversight.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AllWorkView; 