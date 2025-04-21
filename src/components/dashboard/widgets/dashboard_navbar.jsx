import { motion } from 'framer-motion';

const subMenuItems = [
  { id: 'recent', label: 'Recent Projects', path: '/recent' },
  { id: 'favorites', label: 'Favorites', path: '/favorites' },
  { id: 'archive', label: 'Archived', path: '/archive' },
];

const DashboardNavbar = () => {
  return (
    <nav
      className="fixed top-0 left-[4rem] h-screen w-[12rem] bg-[#292830] p-4 flex flex-col space-y-2"
      aria-label="Secondary navigation"
    >
      {subMenuItems.map((item) => (
        <motion.button
          key={item.id}
          className="w-full text-left p-2 rounded-md text-white text-sm hover:bg-[#9674da] focus:bg-[#9674da] focus:outline-none focus:ring-2 focus:ring-[#9674da] focus:ring-offset-2 focus:ring-offset-[#3a3344]"
          aria-label={item.label}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.href = item.path} // Replace with React Router navigation if needed
        >
          {item.label}
        </motion.button>
      ))}
    </nav>
  );
};

export default DashboardNavbar;