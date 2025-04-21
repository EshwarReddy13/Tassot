import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '../global widgets/navbar.jsx';
import BackgroundImage from '../../assets/dashboard_background.png';

const DashboardPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (!user.emailVerified) {
          navigate('/verify-email');
          return;
        }
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (!data.firstName || !data.lastName || !data.email) {
              throw new Error('Incomplete user data.');
            }
            setUserData(data);
          } else {
            setError('User data not found.');
          }
        } catch (err) {
          console.error('Firebase error:', err);
          setError(`Failed to fetch user data: ${err.message}`);
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    }, (err) => {
      console.error('Auth state error:', err);
      setError(`Authentication error: ${err.message}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

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

  return (
    <div className="min-h-screen font-poppins bg-[#292830] flex">
      <div className='p-4'><Navbar /></div>
      <div className="flex-1 flex flex-col md:flex-row gap-2">
        <div className="md:w-1/2 flex flex-col">
          <div className="h-2/3 max-h-[50vh] flex flex-col items-center justify-center p-2">
            {error ? (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            ) : (
              <>
                <motion.h1
                  className="text-white text-2xl font-bold text-center"
                  style={{ fontSize: 'clamp(1.8rem, 3vw, 2.3rem)' }}
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
              className="relative z-10 flex flex-col items-center gap-2 w-100 h-60 hover:bg-[#0e0d0d] bg-[#161616] text-white text-lg font-semibold rounded-lg overflow-hidden gradient-border"
              onClick={() => navigate('/create-project')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Create a new project"
            >
              <img
                src="/favicon.svg"
                alt="Logo icon"
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
                  alt="Plus icon"
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
                alt="Logo icon"
                className="w-22 h-22 mt-8 mb-2 invert scale-x-[-1]"
                style ={{ filter: 'invert(100%)'}}
                onError={(e) => {
                  console.error('Failed to load logo icon');
                  e.target.src = 'https://api.iconify.design/mdi:alert-circle.svg';
                  e.target.style.filter = 'invert(100%)';
                }}
              />
              <div className="flex items-center gap-2">
                <img
                  src="https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/arrow_circle_left/materialsymbolsoutlined/arrow_circle_left_24px.svg"
                  alt="Arrow left icon"
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
      </div>
    </div>
  );
};

export default DashboardPage;