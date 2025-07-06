import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavbar } from '../../contexts/NavbarContext';
import clsx from 'clsx';

// Define main navigation icons
const icons = [
    { id: 'logo', label: 'Logo', path: '/home', url: '/favicon.svg' },
    { id: 'home', label: 'Home', path: '/home', url: 'https://api.iconify.design/mdi:home.svg' },
    { id: 'projects', label: 'Projects', path: '/projects', url: 'https://api.iconify.design/mdi:folder.svg' },
    { id: 'email', label: 'Email', path: '/email', url: 'https://api.iconify.design/mdi:email.svg' },
    { id: 'storage', label: 'Storage', path: '/storage', url: 'https://api.iconify.design/mdi:cloud.svg' },
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
  collapsed: { width: '4.5rem', transition: { duration: 0.5, ease: 'easeInOut' } },
  expanded: { width: '16.5rem', transition: { duration: 0.5, ease: 'easeInOut' } },
  fullExpanded: { width: '10rem', transition: { duration: 0.5, ease: 'easeInOut' } },
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

// UserAvatar component with dropdown menu
const UserAvatar = ({ user, isExpanded }) => {
  const navigate = useNavigate();
  const { logout } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const avatarRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target) && 
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Calculate dropdown position when opening
  const handleToggleDropdown = () => {
    if (!isDropdownOpen && avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      const dropdownWidth = 256; // w-64 = 16rem = 256px
      
      // Position dropdown to the right of the avatar, but ensure it doesn't go off-screen
      let left = rect.right + 24;
      if (left + dropdownWidth > window.innerWidth) {
        // If it would go off-screen, position it to the left of the avatar
        left = rect.left - dropdownWidth - 8;
      }
      
      // Estimate dropdown height (header + menu items + padding)
      const dropdownHeight = 180; // Approximate height of the dropdown
      
      setDropdownPosition({
        top: rect.top - dropdownHeight + 24, // Position so bottom aligns with avatar
        left: Math.max(16, left) // Ensure it doesn't go too far left
      });
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (!user) return null;

  const getInitials = (firstName, lastName) => {
    if (!firstName || !lastName) return 'U';
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const formatUserName = (firstName, lastName) => {
    if (!firstName && !lastName) return 'User';
    if (!firstName) return lastName;
    if (!lastName) return firstName;
    
    const fullName = `${firstName} ${lastName}`;
    const words = fullName.split(' ');
    
    if (words.length <= 2) {
      return fullName;
    } else {
      // For 3+ words, split into multiple lines
      return words.join('\n');
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(true);
    setIsDropdownOpen(false);
  };

  const confirmLogout = async () => {
    try {
      await logout();
      navigate('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    {
      id: 'settings',
      label: 'Settings',
      icon: 'https://api.iconify.design/mdi:cog.svg',
      action: () => navigate('/settings'),
      className: ''
    },
    {
      id: 'theme',
      label: 'Theme',
      icon: isDarkMode 
        ? 'https://api.iconify.design/mdi:weather-night.svg' 
        : 'https://api.iconify.design/mdi:weather-sunny.svg',
      action: toggleTheme,
      className: '',
      isToggle: true,
      toggleValue: isDarkMode
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: 'https://api.iconify.design/mdi:logout.svg',
      action: handleLogout,
      className: 'text-[var(--color-error)] hover:text-red-400'
    }
  ];

  return (
    <>
      <div className="relative" ref={avatarRef}>
        <motion.button
          className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-accent-primary transition-all duration-200"
          onClick={handleToggleDropdown}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="User menu"
        >
          <div className="w-10 h-10 overflow-hidden rounded-full flex items-center justify-center">
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
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-medium text-white whitespace-pre-line leading-tight"
            >
              {formatUserName(user.first_name, user.last_name)}
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* Dropdown Menu Portal */}
      {isDropdownOpen && createPortal(
        <AnimatePresence>
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed w-64 bg-bg-card border border-white/10 rounded-xl shadow-xl backdrop-blur-xl z-[9999]"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%)',
              backdropFilter: 'blur(20px) saturate(200%)',
              WebkitBackdropFilter: 'blur(20px) saturate(200%)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* User Info Header */}
            <div className="p-4 border-b border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent-primary/20 flex items-center justify-center overflow-hidden">
                  {user.photo_url ? (
                    <img
                      src={user.photo_url}
                      alt="User profile"
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-accent-primary font-semibold text-lg">
                      {getInitials(user.first_name, user.last_name)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-text-primary font-semibold text-sm">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-text-secondary text-xs">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2" onClick={(e) => e.stopPropagation()}>
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  {item.isToggle ? (
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/10 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.icon}
                          alt=""
                          className="w-4 h-4"
                          style={{ filter: 'invert(100%)' }}
                        />
                        <span className="text-sm font-medium text-text-secondary">{item.label}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          item.action();
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-transparent ${
                          item.toggleValue ? 'bg-accent-primary' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            item.toggleValue ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ) : (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        item.action();
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all duration-200 ${item.className}`}
                      whileHover={{ x: 5 }}
                    >
                      <img
                        src={item.icon}
                        alt=""
                        className="w-4 h-4"
                        style={{ filter: 'invert(100%)' }}
                      />
                      <span className="text-sm font-medium">{item.label}</span>
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-bg-card border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
              backdropFilter: 'blur(20px) saturate(200%)',
              WebkitBackdropFilter: 'blur(20px) saturate(200%)'
            }}
          >
            <div className="text-center">
              
              {/* Title */}
              <h3 className="text-xl font-bold text-text-primary mb-3">
                Confirm Logout
              </h3>
              
              {/* Message */}
              <p className="text-text-secondary mb-8">
                Are you sure you want to logout? You'll need to sign in again to access your account.
              </p>
              
              {/* Buttons */}
              <div className="flex gap-4 justify-center">
                <motion.button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-6 py-3 rounded-lg bg-white/10 text-text-secondary hover:bg-white/20 transition-colors font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={confirmLogout}
                  className="px-6 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>,
        document.body
      )}
    </>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useUser();
  const { isNavbarExpanded, toggleNavbar } = useNavbar();
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



  // Determine navbar state
  const getNavbarState = () => {
    if (isNavbarExpanded) return 'fullExpanded';
    if (isProjectsRoute && isSubmenuOpen) return 'expanded';
    return 'collapsed';
  };

  // Show all icons except expand (expand will be added separately)
  const visibleIcons = icons.filter(icon => icon.id !== 'expand');

  return (
    <motion.nav
      className="fixed top-0 left-0 h-screen flex flex-col items-start ml-2 bg-bg-primary"
      initial="collapsed"
      animate={getNavbarState()}
      variants={navbarVariants}
      aria-label="Primary navigation"
    >
      <div className="flex flex-row h-full w-full bg-black/80 p-2.5 rounded-xl mt-2 mb-2">
        <div className="flex flex-col items-center w-full py-4 space-y-8 flex-shrink-0">
          {visibleIcons.filter(icon => icon.id !== 'expand').map((icon) => (
            <div key={icon.id} className="relative group flex-shrink-0 w-full">
              <motion.button
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-card transition-all duration-200 ${
                  isNavbarExpanded && icon.id !== 'logo' ? 'justify-start' : 'justify-center'
                } ${icon.id === 'logo' ? '' : 'hover:bg-accent-primary'} ${selectedIcon === icon.id && icon.id !== 'logo' ? 'bg-accent-primary' : ''}`}
                aria-label={icon.label}
                title={icon.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleIconClick(icon)}
              >
                <motion.img
                  src={icon.url}
                  alt={`${icon.label} icon`}
                  className={icon.id === 'logo' ? 'w-12 h-12 flex-shrink-0' : 'w-7 h-7 flex-shrink-0'}
                  style={{
                    filter: icon.id !== 'logo' ? 'invert(100%)' : undefined,
                    objectFit: 'contain',
                  }}
                  transition={{ duration: 0.3 }}
                  onError={(e) => {
                    e.target.src = 'https://api.iconify.design/mdi:alert-circle.svg';
                  }}
                />

                {isNavbarExpanded && icon.id !== 'logo' && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {icon.label}
                  </motion.span>
                )}
              </motion.button>
              {!isNavbarExpanded && icon.id !== 'logo' && (
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-4 bg-bg-secondary text-text-primary text-sm font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {icon.label}
                </span>
              )}
            </div>
          ))}
          {/* Expand/Collapse button above profile */}
          <div className="mt-auto w-full flex justify-center mb-4">
            <motion.button
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-card transition-all duration-200 ${
                isNavbarExpanded ? 'justify-start' : 'justify-center'
              }`}
              onClick={toggleNavbar}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Toggle navbar"
            >
              <motion.img
                src="https://api.iconify.design/mdi:chevron-right.svg"
                alt="Toggle navbar"
                className="w-7 h-7 flex-shrink-0"
                style={{
                  filter: 'invert(100%)',
                  objectFit: 'contain',
                }}
                animate={{ rotate: isNavbarExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              />
              {isNavbarExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  Collapse
                </motion.span>
              )}
            </motion.button>
          </div>
          
          {/* User Avatar at the bottom */}
          <div className="w-full flex justify-center">
            <UserAvatar user={userData} isExpanded={isNavbarExpanded} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isProjectsRoute && isSubmenuOpen && !isNavbarExpanded && (
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
                    className={({ isActive }) =>
                      clsx(
                        "w-full text-left px-4 py-3 rounded-lg text-text-secondary text-base font-medium transition-all duration-150 hover:bg-accent-primary/20 focus:bg-accent-primary/20 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-secondary",
                        {
                          'bg-accent-primary/10 text-accent-primary border-l-4 border-accent-primary': isActive,
                          'border-l-4 border-transparent': !isActive
                        }
                      )
                    }
                    style={{ fontSize: 'clamp(0.95rem, 1.2vw, 1.08rem)' }}
                    aria-label={item.label}
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