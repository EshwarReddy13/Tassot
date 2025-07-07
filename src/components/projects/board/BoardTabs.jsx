import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';

// Tab icons for better visual identification
const TabIcons = {
  kanban: (className) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10V9a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  timeline: (className) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  list: (className) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  'all-work': (className) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  )
};

const BoardTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectUrl } = useParams();

  const tabs = [
    { id: 'kanban', label: 'Kanban', path: `/projects/${projectUrl}` },
    { id: 'timeline', label: 'Timeline', path: `/projects/${projectUrl}/timeline` },
    { id: 'list', label: 'List', path: `/projects/${projectUrl}/list` },
    { id: 'all-work', label: 'All Work', path: `/projects/${projectUrl}/all-work` }
  ];

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === `/projects/${projectUrl}` || path === `/projects/${projectUrl}/`) {
      return 'kanban';
    }
    if (path.includes('/timeline')) return 'timeline';
    if (path.includes('/list')) return 'list';
    if (path.includes('/all-work')) return 'all-work';
    return 'kanban';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tab) => {
    navigate(tab.path);
  };

  return (
    <div className="mt-[3rem] bg-gradient-to-b from-bg-primary/90 to-bg-primary/70 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <div className="flex items-end px-6 pt-4 pb-0 gap-2">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const IconComponent = TabIcons[tab.id];
          
          return (
            <motion.div
              key={tab.id}
              className="relative"
              initial={false}
              animate={{ 
                scale: isActive ? 1 : 0.95,
                y: isActive ? -2 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Tab separator */}
              {index > 0 && !isActive && activeTab !== tabs[index - 1]?.id && (
                <div className="absolute left-0 top-2 bottom-2 w-px bg-white/10" />
              )}
              
              <motion.button
                onClick={() => handleTabClick(tab)}
                className={clsx(
                  'relative flex items-center gap-2.5 px-5 py-3.5 text-sm font-medium',
                  'transition-all duration-300 ease-out',
                  'min-w-[120px] justify-center',
                  {
                    // Active tab styling - no bottom border to avoid line overlap
                    'bg-bg-card text-text-primary shadow-lg shadow-black/20': isActive,
                    ' border-t border-l border-r border-white/20 border-b-0': isActive,
                    'before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent ': isActive,
                    // Extend active tab slightly to cover the tab bar line
                    'relative z-10 mb-[-1px]': isActive,
                    
                    // Inactive tab styling
                    'bg-transparent text-text-secondary hover:text-text-primary': !isActive,
                    'hover:bg-white/5 ': !isActive,
                    'border border-transparent hover:border-white/10': !isActive,
                  }
                )}
                whileHover={!isActive ? { 
                  y: -2,
                  transition: { type: "spring", stiffness: 400, damping: 25 }
                } : {}}
                whileTap={{ scale: 0.98 }}
                aria-pressed={isActive}
                aria-label={`Switch to ${tab.label} view`}
              >
                {/* Glass overlay for active tab */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-white/[0.02] "
                    layoutId="activeTabOverlay"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                
                {/* Tab content */}
                <div className="relative z-10 flex items-center gap-2.5">
                  {IconComponent && IconComponent(clsx(
                    'w-4 h-4 transition-colors duration-200',
                    {
                      'text-accent-primary': isActive,
                      'text-text-secondary': !isActive
                    }
                  ))}
                  <span className="font-medium tracking-wide">{tab.label}</span>
                </div>
                
                {/* Active tab bottom highlight */}
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-accent-primary/60 via-accent-primary to-accent-primary/60 rounded-full"
                    layoutId="activeTabHighlight"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BoardTabs; 