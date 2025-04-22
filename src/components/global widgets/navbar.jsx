import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const icons = [
  { id: 'logo', label: 'Logo', path: '/dashboard', url: '/favicon.svg' },
  { id: 'home', label: 'Home', path: '/dashboard', url: 'https://api.iconify.design/mdi:home.svg' },
  { id: 'projects', label: 'Projects', path: '/projects', url: 'https://api.iconify.design/mdi:folder.svg' },
  { id: 'settings', label: 'Settings', path: '/settings', url: 'https://api.iconify.design/mdi:cog.svg' },
];

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav
      className="fixed top-0 left-0 h-screen w-[4rem] bg-[#161616] flex flex-col items-center py-4 space-y-4"
      aria-label="Primary navigation"
    >
      {icons.map((icon) => (
        <motion.button
          key={icon.id} 
          className={icon.id === 'logo' ? 'p-2 rounded-md text-white' : 'p-2 rounded-md text-white hover:bg-[#9674da] focus:bg-[#9674da] focus:outline-none focus:ring-2 focus:ring-[#9674da] focus:ring-offset-2 focus:ring-offset-[#161616]'}
          aria-label={icon.label}
          title={icon.label}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(icon.path)}
        >
          <img
            src={icon.url}
            alt={`${icon.label} icon`}
            className={icon.id === 'logo' ? 'w-12 h-12' : 'w-7 h-7'}
            style={icon.id === 'logo' ? {} : { filter: 'invert(100%)' }}
            onError={(e) => {
              console.error(`Failed to load icon: ${icon.url}`);
              e.target.src = 'https://api.iconify.design/mdi:alert-circle.svg';
              e.target.style.filter = icon.id === 'logo' ? '' : 'invert(100%)';
            }}
          />
        </motion.button>
      ))}
    </nav>
  );
};

export default Navbar;