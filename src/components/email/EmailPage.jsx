import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const EmailPage = () => {
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowComingSoon(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl">📧</span>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Email Center</h1>
              <p className="text-text-secondary mt-1">Manage your project communications</p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        >
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div 
              className="border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)'
              }}
            >
              <h2 className="text-text-primary text-xl font-bold mb-4">Folders</h2>
              <div className="space-y-2">
                {['Inbox', 'Sent', 'Drafts', 'Archive', 'Spam'].map((folder, index) => (
                  <motion.button
                    key={folder}
                    className="w-full text-left px-3 py-2 rounded-lg text-text-secondary hover:bg-white/10 hover:text-text-primary transition-all duration-200"
                    whileHover={{ x: 5 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {folder}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Email List */}
          <div className="lg:col-span-2">
            <div 
              className="border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-text-primary text-xl font-bold">Inbox</h2>
                <motion.button
                  className="bg-accent-primary hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Compose
                </motion.button>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((item, index) => (
                  <motion.div
                    key={item}
                    className="p-4 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer"
                    whileHover={{ scale: 1.02, y: -2 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-accent-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-accent-primary font-semibold">
                          {String.fromCharCode(65 + (item % 26))}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-text-primary font-semibold">Project Update #{item}</h3>
                          <span className="text-text-tertiary text-sm">2 hours ago</span>
                        </div>
                        <p className="text-text-secondary text-sm mb-1">from: team@project{item}.com</p>
                        <p className="text-text-tertiary text-sm line-clamp-2">
                          This is a placeholder email content for demonstration purposes. 
                          The actual email functionality will be implemented here.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Email Preview */}
          <div className="lg:col-span-1">
            <div 
              className="border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)'
              }}
            >
              <h2 className="text-text-primary text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {['Reply', 'Forward', 'Mark as Read', 'Delete', 'Archive'].map((action, index) => (
                  <motion.button
                    key={action}
                    className="w-full text-left px-3 py-2 rounded-lg text-text-secondary hover:bg-white/10 hover:text-text-primary transition-all duration-200"
                    whileHover={{ x: 5 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {action}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Placeholder Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 text-center"
        >
          <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-xl p-6">
            <p className="text-text-secondary">
              📧 <strong>Email functionality coming soon!</strong> This is a placeholder page for the email center. 
              The actual email integration will be implemented here.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showComingSoon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-20 right-0 bottom-0 z-[10000] flex items-center justify-center"
            style={{
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 300,
                delay: 0.2
              }}
              className="relative max-w-md w-full mx-4"
            >
              {/* Main Modal */}
              <div 
                className="bg-bg-card border border-white/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  backdropFilter: 'blur(20px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(200%)'
                }}
              >
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      duration: 20, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                    className="absolute -top-20 -right-20 w-40 h-40 bg-accent-primary/10 rounded-full blur-xl"
                  />
                  <motion.div
                    animate={{ 
                      rotate: -360,
                      scale: [1, 0.9, 1],
                    }}
                    transition={{ 
                      duration: 15, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                    className="absolute -bottom-20 -left-20 w-32 h-32 bg-accent-secondary/10 rounded-full blur-xl"
                  />
                </div>

                {/* Content */}
                <div className="relative z-10 text-center">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      damping: 15, 
                      stiffness: 200,
                      delay: 0.4
                    }}
                    className="w-20 h-20 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                  >
                    <span className="text-3xl">📧</span>
                  </motion.div>
                  
                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-2xl font-bold text-text-primary mb-3"
                  >
                    Feature Coming Soon
                  </motion.h2>
                  
                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-text-secondary mb-8 leading-relaxed"
                  >
                    We're working hard to bring you a powerful email management system. 
                    Stay tuned for seamless project communication and collaboration features.
                  </motion.p>
                  
                  {/* Progress Bar */}
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                    className="w-full bg-white/10 rounded-full h-2 mb-6 overflow-hidden"
                  >
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "75%" }}
                      transition={{ delay: 1.5, duration: 2, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full"
                    />
                  </motion.div>
                  
                  {/* Status */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="flex items-center justify-center gap-2 mb-8"
                  >
                    <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse" />
                    <span className="text-sm text-text-secondary font-medium">
                      Development in Progress
                    </span>
                  </motion.div>
                  
                  {/* Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.2 }}
                    onClick={() => setShowComingSoon(false)}
                    className="px-8 py-3 bg-accent-primary hover:bg-accent-hover text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Got it!
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmailPage; 