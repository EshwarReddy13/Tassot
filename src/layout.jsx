// components/global widgets/Layout.jsx
import Navbar from './components/global widgets/navbar.jsx';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
