import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Define main navigation icons
const icons = [
  { id: 'logo', label: 'Logo', path: '/dashboard', url: '/favicon.svg' },
  { id: 'home', label: 'Home', path: '/dashboard', url: 'https://api.iconify.design/mdi:home.svg' },
  { id: 'projects', label: 'Projects', path: '/projects', url: 'https://api.iconify.design/mdi:folder.svg' },
  { id: 'settings', label: 'Settings', path: '/settings', url: 'https://api.iconify.design/mdi:cog.svg' },
];

// Define submenu items for Projects
const subMenuItems = [
  { id: 'recent', label: 'Recent Activity', path: 'recent' },
  { id: 'favorites', label: 'Favorites', path: 'favorites' },
  { id: 'archive', label: 'Archived', path: 'archive' },
];

// Animation variants for the navbar width (including ml-2 margin)
const navbarVariants = {
  collapsed: { width: '5rem', transition: { duration: 0.5, ease: 'easeInOut' } },
  expanded: { width: '16.5rem', transition: { duration: 0.5, ease: 'easeInOut' } },
};

// Animation variants for the subnavbar
const subnavVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95, 
    transition: { 
      duration: 0.2, 
      ease: [0.25, 0.1, 0.25, 1] // Use cubic-bezier instead of 'easeInOut'
    } 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 0.2, 
      ease: [0.25, 0.1, 0.25, 1], 
      delay: 0.3 
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    transition: { 
      duration: 0.2, 
      ease: [0.25, 0.1, 0.25, 1] 
    } 
  },
};

// Animation variants for submenu items (staggered)
const submenuItemVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.1, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.2 + 0.9 },
  }),
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedIcon, setSelectedIcon] = useState('home');
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  // Check if the current URL starts with /projects/
  const isProjectsRoute = location.pathname.startsWith('/projects/');

  // Sync submenu state with route changes
  useEffect(() => {
    if (isProjectsRoute) {
      setIsSubmenuOpen(true);
      setSelectedIcon('projects');
    } else {
      setIsSubmenuOpen(false);
    }
  }, [isProjectsRoute]);

  // Handle main icon click
  const handleIconClick = (icon) => {
    setSelectedIcon(icon.id);
    navigate(icon.path);
    if (icon.id === 'projects') {
      setIsSubmenuOpen(true);
    } else {
      setIsSubmenuOpen(false);
    }
  };

  // Handle submenu item click
  const handleSubmenuClick = (item) => {
    navigate(`/projects/${item.path}`);
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 h-screen flex flex-col items-start ml-1 bg-[#292830]"
      initial="collapsed"
      animate={isProjectsRoute && isSubmenuOpen ? 'expanded' : 'collapsed'}
      variants={navbarVariants}
      aria-label="Primary navigation"
    >
      {/* Main Navigation and Submenu Container */}
      <div
        className={`flex flex-row h-full w-full bg-bg-dark p-2.5 rounded-xl ${
          isProjectsRoute && isSubmenuOpen ? 'mr-2' : 'mr-0'
        } mt-2 mb-2`}
      >
        {/* Main Navigation Icons */}
        <div
          className={`flex flex-col items-center w-[4rem] py-4 space-y-4 ${
            isProjectsRoute && isSubmenuOpen ? 'mr-2' : 'mr-1'
          } flex-shrink-0`}
        >
          {icons.map((icon) => (
            <div key={icon.id} className="relative group flex-shrink-0">
              <motion.button
                className={
                  icon.id === 'logo'
                    ? 'p-2 rounded-md text-white'
                    : `p-2 rounded-md text-white hover:bg-[#9674da] ${
                        selectedIcon === icon.id
                          ? 'bg-[#9674da]'
                          : ''
                      } focus:outline-none focus:ring-2 focus:ring-[#9674da] focus:ring-offset-2 focus:ring-offset-[#292830]`
                }
                aria-label={icon.label}
                title={icon.label}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleIconClick(icon)}
              >
                <img
                  src={icon.url}
                  alt={`${icon.label} icon`}
                  className={icon.id === 'logo' ? 'w-12 h-12' : 'w-8 h-8'}
                  style={{
                    ...(icon.id === 'logo' ? {} : { filter: 'invert(100%)' }),
                    minWidth: icon.id === 'logo' ? '48px' : '28px',
                    minHeight: icon.id === 'logo' ? '48px' : '28px',
                  }}
                  onError={(e) => {
                    console.error(`Failed to load icon: ${icon.url}`);
                    e.target.src = 'https://api.iconify.design/mdi:alert-circle.svg';
                    e.target.style.filter = icon.id === 'logo' ? '' : 'invert(100%)';
                  }}
                />
              </motion.button>
              {/* Tooltip for label on hover */}
              <span
                className="
                  absolute left-full top-1/2 -translate-y-1/2 ml-5
                  bg-[#670089] text-white text-sm font-medium
                  px-2 py-1 rounded-md
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-200
                  pointer-events-none
                  whitespace-nowrap
                "
              >
                {icon.label}
              </span>
            </div>
          ))}
        </div>

        {/* Submenu for Projects */}
        <AnimatePresence mode="wait">
          {isProjectsRoute && isSubmenuOpen && (
            <motion.div
              key="submenu"
              className="h-full w-[12rem] p-4 flex flex-col space-y-2 bg-[#292830] rounded-lg"
              variants={subnavVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              aria-label="Secondary navigation"
            >
              <motion.div
                className="w-full rounded-lg px-2 py-1"
                variants={submenuItemVariants}
                custom={0}
                initial="hidden"
                animate="visible"
              >
                <h2
                  className="text-white text-lg font-semibold"
                  style={{ fontSize: 'clamp(1rem, 1.5vw, 1.2rem)' }}
                >
                  Projects
                </h2>
              </motion.div>
              {subMenuItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="w-full rounded-lg px-2 py-2"
                  variants={submenuItemVariants}
                  custom={index + 1}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.button
                    className="
                      w-full text-left p-2 rounded-lg text-white text-sm hover:bg-[#9674da]
                      focus:bg-[#9674da] focus:outline-none focus:ring-2 focus:ring-[#9674da]
                      focus:ring-offset-2 focus:ring-offset-[#3a3344]"
                    style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }}
                    aria-label={item.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSubmenuClick(item)}
                  >
                    {item.label}
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;