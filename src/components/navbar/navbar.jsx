import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import clsx from 'clsx'; // --- [THIS IS THE FIX] The missing import is now re-added ---

// Define main navigation icons
const icons = [
    { id: 'logo', label: 'Logo', path: '/home', url: '/favicon.svg' },
    { id: 'home', label: 'Home', path: '/home', url: 'https://api.iconify.design/mdi:home.svg' },
    { id: 'projects', label: 'Projects', path: '/projects', url: 'https://api.iconify.design/mdi:folder.svg' },
    { id: 'settings', label: 'Settings', path: '/settings', url: 'https://api.iconify.design/mdi:cog.svg' },
];

// Define submenu items for Projects
const subMenuItems = [ 
  { id: 'dashboard', label: 'Dashboard', path: 'dashboard' },
  { id: 'board', label: 'Board', path: '' }, 
  { id: 'users', label: 'Users', path: 'users' },
  { id: 'settings', label: 'Settings', path: 'settings' },
];

// Animation variants for the navbar width
const navbarVariants = {
  collapsed: { width: '5rem', transition: { duration: 0.5, ease: 'easeInOut' } },
  expanded: { width: '16.5rem', transition: { duration: 0.5, ease: 'easeInOut' } },
};

// Animation variants for the subnavbar
const subnavVariants = {
  hidden: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] } },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] } },
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

// UserAvatar component for displaying profile picture or initials
const UserAvatar = ({ user }) => {
  if (!user) return null;

  const getInitials = (firstName, lastName) => {
    if (!firstName || !lastName) return 'U';
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-center w-10 h-10 overflow-hidden rounded-full cursor-pointer bg-accent-primary ring-2 ring-offset-2 ring-offset-bg-card ring-accent-hover">
        {user.photo_url ? (
          <img
            src={user.photo_url}
            alt="User profile"
            className="object-cover w-full h-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="text-base font-semibold text-text-primary">
            {getInitials(user.first_name, user.last_name)}
          </span>
        )}
      </div>
       <span className="absolute left-full top-1/2 -translate-y-1/2 ml-4 bg-bg-secondary text-text-primary text-sm font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        {user.first_name} {user.last_name}
      </span>
    </div>
  );
};


const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useUser();
  const [selectedIcon, setSelectedIcon] = useState('home');
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  const isProjectsRoute = location.pathname.startsWith('/projects/');
  const projectUrl = isProjectsRoute ? location.pathname.split('/')[2] : null;


  useEffect(() => {
    setIsSubmenuOpen(isProjectsRoute);
    if (isProjectsRoute) {
      setSelectedIcon('projects');
    }
  }, [location.pathname, isProjectsRoute]);

  const handleIconClick = (icon) => {
    setSelectedIcon(icon.id);
    navigate(icon.path);
    setIsSubmenuOpen(icon.id === 'projects');
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 h-screen flex flex-col items-start ml-2 bg-bg-primary"
      initial="collapsed"
      animate={isProjectsRoute && isSubmenuOpen ? 'expanded' : 'collapsed'}
      variants={navbarVariants}
      aria-label="Primary navigation"
    >
      <div className="flex flex-row h-full w-full bg-bg-dark p-2.5 rounded-xl mt-2 mb-2">
        <div className="flex flex-col items-center w-[4rem] py-4 space-y-4 flex-shrink-0">
          {icons.map((icon) => (
            <div key={icon.id} className="relative group flex-shrink-0">
              <motion.button
                className={`p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-card ${
                  icon.id === 'logo' ? '' : 'hover:bg-accent-primary'
                } ${selectedIcon === icon.id && icon.id !== 'logo' ? 'bg-accent-primary' : ''}`}
                aria-label={icon.label}
                title={icon.label}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleIconClick(icon)}
              >
                <img
                  src={icon.url}
                  alt={`${icon.label} icon`}
                  className={icon.id === 'logo' ? 'w-12 h-12' : 'w-7 h-7'}
                  style={{
                    filter: icon.id !== 'logo' ? 'invert(100%)' : undefined,
                    minWidth: icon.id === 'logo' ? '3rem' : '1.75rem',
                    minHeight: icon.id === 'logo' ? '3rem' : '1.75rem',
                  }}
                  onError={(e) => {
                    e.target.src = 'https://api.iconify.design/mdi:alert-circle.svg';
                  }}
                />
              </motion.button>
              <span className="absolute left-full top-1/2 -translate-y-1/2 ml-4 bg-bg-secondary text-text-primary text-sm font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {icon.label}
              </span>
            </div>
          ))}
          {/* User Avatar pushed to the bottom */}
          <div className="mt-auto">
            <UserAvatar user={userData} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isProjectsRoute && isSubmenuOpen && (
            <motion.div
              key="submenu"
              className="h-full w-[12rem] p-4 flex flex-col space-y-2 bg-bg-secondary rounded-lg ml-2"
              variants={subnavVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              aria-label="Secondary navigation"
            >
              <motion.div variants={submenuItemVariants} custom={0} initial="hidden" animate="visible">
                <h2 className="text-text-primary text-lg font-semibold px-2 py-1" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.2rem)' }}>
                  Project
                </h2>
              </motion.div>
              {subMenuItems.map((item, index) => (
                <motion.div key={item.id} variants={submenuItemVariants} custom={index + 1} initial="hidden" animate="visible">
                  <NavLink
                      to={item.path ? `/projects/${projectUrl}/${item.path}` : `/projects/${projectUrl}`} end
                      className={({ isActive }) => clsx("w-full text-left p-2 rounded-lg text-text-secondary text-sm hover:bg-accent-primary hover:text-text-primary focus:bg-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-secondary", { 'bg-accent-primary text-text-primary': isActive })}
                      style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }} aria-label={item.label}
                  >
                      {item.label}
                  </NavLink>
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