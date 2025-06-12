import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react'; // Added useEffect for completeness, though not strictly needed for this fix

import { useUser } from '../../contexts/UserContext.jsx';
import CreateProjectDrawer from './widgets/dashboardCreateProject.jsx'; // Ensure this path is correct
import BackgroundImage from '../../assets/dashboard_background.png'; // Ensure this path is correct

const DashboardPage = () => {
  // Destructure firebaseUser along with userData, loading, error
  const { userData, firebaseUser, loading, error } = useUser();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Log state for debugging
  useEffect(() => {
    // This useEffect is just for logging and doesn't change behavior.
    // The redirect logic is handled directly in the render return path.
    console.log('DashboardPage context state:', { userData, firebaseUser, loading, error });
  }, [userData, firebaseUser, loading, error]);


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

  // If there's no firebaseUser, the user is not authenticated with Firebase.
  // UserData might be missing if the backend fetch failed or if the user doesn't exist in PSQL yet (context should handle this).
  // Primary check for auth should be firebaseUser.
  if (!firebaseUser) {
    console.log('Redirecting to /login: No Firebase user session.');
    // Using useEffect for navigation is generally preferred over calling navigate directly in render logic
    // but for immediate conditional rendering/redirects this pattern is also common.
    // To be safer with React's render cycle, you might wrap navigate calls in useEffect:
    // useEffect(() => { if (!firebaseUser && !loading) navigate('/login', { replace: true }); }, [firebaseUser, loading, navigate]);
    navigate('/login', { replace: true });
    return null; // Return null to prevent rendering anything else
  }

  // If firebaseUser exists, then check for email verification.
  // userData might still be loading if UserContext's fetchUserProfile is slightly delayed after firebaseUser is set.
  // However, the main 'loading' flag from useUser should cover the broader initial data fetching.
  if (!firebaseUser.emailVerified) {
    console.log('Redirecting to /verify-email: Email not verified on firebaseUser.');
    navigate('/verify-email', { replace: true });
    return null;
  }

  // After confirming Firebase auth and email verification, check if userData (from PSQL) exists.
  // If firebaseUser exists and is verified, but userData is null and not loading,
  // it implies an issue with fetching/creating the user in your backend database via UserContext.
  // UserContext should ideally set an 'error' state in this scenario.
  if (!userData && !loading && !error) {
    // This state might indicate that UserContext is still fetching userData or failed silently.
    // The 'error' prop from useUser() should be checked.
    console.log('DashboardPage: firebaseUser exists, email verified, but no userData from backend and no explicit error/loading. This could be a sync issue.');
    // Optionally, show a different loading/error state or redirect.
    // For now, we'll proceed assuming if firebaseUser is good, userData should follow or error will be set.
    // If error is set, it's handled in the JSX below.
  }


  return (
    <section className="min-h-screen font-poppins bg-[#292830] flex" aria-label="Dashboard">
      <main className="flex-1 flex flex-col md:flex-row gap-2 p-2 sm:p-4"> {/* Added some padding */}
        <div className="md:w-1/2 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center p-2 text-center"> {/* Adjusted for better centering and responsiveness */}
            {error ? (
              <p className="text-red-400 text-sm mb-4" role="alert">
                Failed to load dashboard data: {error}
              </p>
            ) : userData ? ( // Only display welcome if userData is successfully loaded
              <>
                <motion.h1
                  className="text-white text-3xl font-bold"
                  style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Welcome to{' '}
                  <span className="animated-gradient-text font-bold">
                    Tassot
                  </span>
                  , {userData.first_name || firebaseUser.displayName?.split(' ')[0] || 'User'} {/* Corrected to userData.first_name */}
                </motion.h1>
                <motion.p
                  className="text-gray-400 text-sm mt-2 max-w-md"
                  style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.1rem)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Tassot helps you collaborate on projects with ease, bringing your ideas to life through seamless teamwork and innovative tools.
                </motion.p>
              </>
            ) : (
              // This case would be if !userData but also no error and not loading.
              // Could be a brief moment or indicate an issue if persistent.
              <p className="text-gray-400">Loading user information...</p>
            )}
          </div>
          <div className="h-auto md:h-48 flex items-center justify-center md:justify-end p-2 md:pr-4"> {/* Adjusted height and padding */}
            <motion.button
              className="flex flex-col items-center justify-center gap-2 w-full max-w-xs md:max-w-none md:w-auto h-auto p-6 bg-[#161616] hover:bg-[#0e0d0d] text-white text-lg font-semibold rounded-lg overflow-hidden gradient-border"
              onClick={() => setIsDrawerOpen(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              aria-label="Create a new project"
            >
              <img
                src="/favicon.svg" // Assuming this is in your public folder
                alt="Tassot logo icon"
                className="w-16 h-16 sm:w-20 sm:h-20 mb-1 sm:mb-2" // Adjusted size
                onError={(e) => {
                  console.error('Failed to load logo icon: /favicon.svg');
                  e.target.style.display = 'none'; // Hide if broken
                }}
              />
              <div className="flex items-center gap-2">
                <img
                  src="https://api.iconify.design/mdi:plus.svg?color=white" // Added color query param
                  alt="" // Decorative
                  className="w-8 h-8 sm:w-10 sm:h-10" // Adjusted size
                  // Removed style={{ filter: 'invert(100%)' }} as color is in URL
                  onError={(e) => {
                    console.error('Failed to load plus icon');
                    e.target.style.display = 'none';
                  }}
                />
                <p className="text-xl sm:text-2xl">Create New Project</p>
              </div>
            </motion.button>
          </div>
        </div>
        <div className="md:w-1/2 flex flex-col">
          <div
            className="flex-1 min-h-[200px] sm:min-h-[300px] md:h-2/3 bg-cover bg-center rounded-lg" // Added rounded-lg
            style={{
              backgroundImage: `url(${BackgroundImage})`,
              backgroundColor: '#1f1e25', // Fallback background color
            }}
            role="img"
            aria-label="Decorative dashboard background image"
          ></div>
          <div className="h-auto md:h-48 flex items-center justify-center md:justify-start p-2 md:pl-4 mt-2 md:mt-0"> {/* Adjusted height, padding, and margin */}
             <motion.button
              className="flex flex-col items-center justify-center gap-2 w-full max-w-xs md:max-w-none md:w-auto h-auto p-6 bg-[#161616] hover:bg-[#0e0d0d] text-white text-lg font-semibold rounded-lg overflow-hidden" // Removed gradient-border for variety
              onClick={() => navigate('/join-project')} // Ensure this route exists
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              aria-label="Join an existing project"
            >
              <img
                src="/favicon.svg"
                alt="Tassot logo icon"
                className="w-16 h-16 sm:w-20 sm:h-20 mb-1 sm:mb-2" // Matched size with create button
                style={{ filter: 'invert(100%)' }} // Keep invert if needed for this logo variant
                onError={(e) => {
                  console.error('Failed to load logo icon for join: /favicon.svg');
                  e.target.style.display = 'none';
                }}
              />
              <div className="flex items-center gap-2">
                <img
                  src="https://api.iconify.design/mdi:arrow-right-bold-circle-outline.svg?color=white" // Changed icon, added color
                  alt="" // Decorative
                  className="w-8 h-8 sm:w-10 sm:h-10" // Adjusted size
                  onError={(e) => {
                    console.error('Failed to load arrow icon');
                    e.target.style.display = 'none';
                  }}
                />
                <p className="text-xl sm:text-2xl">Join Existing Project</p>
              </div>
            </motion.button>
          </div>
        </div>
      </main>
      <CreateProjectDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        // Pass any necessary props to CreateProjectDrawer
      />
    </section>
  );
};

export default DashboardPage;