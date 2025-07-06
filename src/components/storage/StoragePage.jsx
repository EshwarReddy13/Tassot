import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StoragePage = () => {
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowComingSoon(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="text-8xl mb-6">☁️</div>
          <h1 className="text-4xl font-bold text-text-primary mb-4">Storage & Drive</h1>
          <p className="text-xl text-text-secondary leading-relaxed">
            Your centralized file storage and document management hub
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Feature Cards */}
          <div className="bg-bg-secondary border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">File Management</h3>
            <p className="text-text-secondary text-sm">Organize and manage all your project files in one place</p>
          </div>

          <div className="bg-bg-secondary border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Secure Storage</h3>
            <p className="text-text-secondary text-sm">Enterprise-grade security for your sensitive documents</p>
          </div>

          <div className="bg-bg-secondary border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Team Collaboration</h3>
            <p className="text-text-secondary text-sm">Share files and collaborate seamlessly with your team</p>
          </div>

          <div className="bg-bg-secondary border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Version Control</h3>
            <p className="text-text-secondary text-sm">Track changes and maintain file version history</p>
          </div>

          <div className="bg-bg-secondary border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Smart Search</h3>
            <p className="text-text-secondary text-sm">Find files instantly with advanced search capabilities</p>
          </div>

          <div className="bg-bg-secondary border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Cross-Platform</h3>
            <p className="text-text-secondary text-sm">Access your files from any device, anywhere</p>
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
            className="fixed inset-0 z-[10000] flex items-center justify-center"
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
                    <span className="text-3xl">☁️</span>
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
                    We're working hard to bring you a powerful storage and file management system. 
                    Stay tuned for seamless file organization and collaboration features.
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

export default StoragePage; 