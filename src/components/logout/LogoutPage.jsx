/**
 * LogoutPage Component
 * 
 * Automatically logs out the user and redirects them to the login page.
 * This component handles the Firebase sign-out process and provides
 * visual feedback during the logout process.
 * 
 * @component
 * @returns {JSX.Element} The logout page component (briefly shown during logout)
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase.js';
import { motion } from 'framer-motion';

export default function LogoutPage() {
  const navigate = useNavigate();
  const [logoutStatus, setLogoutStatus] = useState('Logging out...');

  useEffect(() => {
    const performLogout = async () => {
      try {
        setLogoutStatus('Signing out...');
        
        // Sign out from Firebase
        await signOut(auth);
        
        setLogoutStatus('Redirecting to login...');
        
        // Brief delay to show the status message
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1000);
        
      } catch (error) {
        console.error('Logout error:', error);
        setLogoutStatus('Logout failed. Redirecting...');
        
        // Even if logout fails, redirect to login page
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    };

    // Start logout process immediately when component mounts
    performLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary font-poppins">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Loading Spinner */}
        <motion.div
          className="w-16 h-16 border-4 border-t-accent-primary border-text-secondary/20 rounded-full animate-spin mx-auto mb-6"
          role="status"
          aria-live="polite"
          aria-label="Logging out"
        />

        {/* Status Message */}
        <motion.h2
          className="text-xl font-semibold text-text-primary mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {logoutStatus}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="text-sm text-text-secondary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          Please wait while we sign you out...
        </motion.p>
      </motion.div>
    </div>
  );
} 