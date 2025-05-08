import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';

import { useUser } from '../../contexts/userContext.jsx';
import CreateProjectDrawer from './widgets/dashboardCreateProject.jsx';
import BackgroundImage from '../../assets/dashboard_background.png';

const DashboardPage = () => {
  const { userData, loading, error } = useUser();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Log state for debugging
  console.log('DashboardPage state:', { userData, loading, error });

  // Handle redirects
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1f1e25] font-poppins">
        <div
          className="w-[2.5rem] h-[2.5rem] border-[0.25rem] border-t-[#9674da] border-[#ffffff33] rounded-full animate-spin"
          role="status"
          aria-live="polite"
          aria-label="Loading dashboard"
        ></div>
      </div>
    );
  }

  if (!userData) {
    console.log('Redirecting to /login: No user data');
    navigate('/login', { replace: true });
    return null;
  }

  if (!userData.emailVerified) {
    console.log('Redirecting to /verify-email: Email not verified');
    navigate('/verify-email', { replace: true });
    return null;
  }

  return (
    <section className="min-h-screen font-poppins bg-[#292830] flex" aria-label="Dashboard">
      <main className="flex-1 flex flex-col md:flex-row gap-2">
        <div className="md:w-1/2 flex flex-col">
          <div className="h-2/3 max-h-[50vh] flex flex-col items-center justify-center p-2">
            {error ? (
              <p className="text-red-400 text-sm mb-4" role="alert">
                {error}
              </p>
            ) : (
              <>
                <motion.h1
                  className="text-white text-3xl font-bold text-center"
                  style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Welcome to{' '}
                  <span className="animated-gradient-text font-bold">
                    Tassot
                  </span>
                  , {userData?.firstName || 'User'}
                </motion.h1>
                <motion.p
                  className="text-gray-400 text-sm text-center mt-2 max-w-md"
                  style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.1rem)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Tassot helps you collaborate on projects with ease, bringing your ideas to life through seamless teamwork and innovative tools.
                </motion.p>
              </>
            )}
          </div>
          <div className="h-24 flex justify-end pr-2">
            <motion.button
              className="relative z-10 flex flex-col items-center gap-2 w-100 h-60 bg-[#161616] hover:bg-[#0e0d0d] text-white text-lg font-semibold rounded-lg overflow-hidden gradient-border"
              onClick={() => setIsDrawerOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Create a new project"
            >
              <img
                src="/favicon.svg"
                alt="Tassot logo icon"
                className="w-22 h-22 mt-8 mb-2"
                onError={(e) => {
                  console.error('Failed to load logo icon');
                  e.target.src = 'https://api.iconify.design/mdi:alert-circle.svg';
                  e.target.style.filter = 'invert(100%)';
                }}
              />
              <div className="flex items-center gap-2">
                <img
                  src="https://api.iconify.design/mdi:plus.svg"
                  alt="Plus icon indicating new project creation"
                  className="w-10 h-10"
                  style={{ filter: 'invert(100%)' }}
                  onError={(e) => {
                    console.error('Failed to load plus icon');
                    e.target.src = 'https://api.iconify.design/mdi:alert-circle.svg';
                    e.target.style.filter = 'invert(100%)';
                  }}
                />
                <p className="text-2xl">Create a New Project</p>
              </div>
            </motion.button>
          </div>
        </div>
        <div className="md:w-1/2 flex flex-col pl-2">
          <div
            className="h-2/3 max-h-[50vh] bg-cover bg-center"
            style={{
              backgroundImage: `url(${BackgroundImage})`,
              backgroundColor: '#292830',
            }}
            role="img"
            aria-label="Decorative dashboard background"
          ></div>
          <div className="h-24 flex">
            <motion.button
              className="w-100 h-60 bg-[#161616] text-white flex flex-col items-center text-lg font-semibold rounded-lg hover:bg-[#0e0d0d]"
              onClick={() => navigate('/join-project')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Join an existing project"
            >
              <img
                src="/favicon.svg"
                alt="Tassot logo icon"
                className="w-22 h-22 mt-8 mb-2 invert scale-x-[-1]"
                style={{ filter: 'invert(100%)' }}
                onError={(e) => {
                  console.error('Failed to load logo icon');
                  e.target.src = 'https://api.iconify.design/mdi:alert-circle.svg';
                  e.target.style.filter = 'invert(100%)';
                }}
              />
              <div className="flex items-center gap-2">
                <img
                  src="https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/arrow_circle_left/materialsymbolsoutlined/arrow_circle_left_24px.svg"
                  alt="Arrow left icon indicating joining a project"
                  className="w-10 h-10"
                  style={{ filter: 'invert(100%)' }}
                  onError={(e) => {
                    console.error('Failed to load arrow icon');
                    e.target.src = 'https://api.iconify.design/mdi:alert-circle.svg';
                    e.target.style.filter = 'invert(100%)';
                  }}
                />
                <p className="text-2xl">Join an Existing Project</p>
              </div>
            </motion.button>
          </div>
        </div>
      </main>
      <CreateProjectDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </section>
  );
};

export default DashboardPage;