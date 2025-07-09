import { motion } from 'framer-motion';

const ListView = () => {
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-text-primary mb-3">List View</h2>
        <p className="text-text-secondary text-lg mb-6">
          View all your tasks in a clean, organized list format with advanced filtering options.
        </p>
        
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-3">Coming Soon</h3>
          <p className="text-text-secondary text-sm">
            The list view will provide a table-like interface with sorting, filtering, and bulk actions for efficient task management.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ListView; 