// components/global widgets/Layout.jsx
import { useLocation } from 'react-router-dom';
import Navbar from './components/global widgets/navbar.jsx'; // Adjust the path if needed
import { Outlet } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();

  // Check if the current URL starts with /projects/ (same logic as in Navbar)
  const isProjectsRoute = location.pathname.startsWith('/projects/');

  // Calculate the navbar's width (same as in navbarVariants, including ml-2)
  const navbarWidth = isProjectsRoute ? '16.5rem' : '2.5rem'; // Expanded: 16.5rem, Collapsed: 5rem
  const marginLeft = `calc(${navbarWidth})`; // ml-2 is already included in navbarWidth

  return (
    <div className="flex h-screen">
      <Navbar />
      <div
        className="flex-1 h-full overflow-auto"
        style={{ marginLeft }} // Dynamically set margin-left based on navbar width
      >
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;