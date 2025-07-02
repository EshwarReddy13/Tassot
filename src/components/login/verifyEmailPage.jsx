import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Import auth object if still needed for direct use, or rely solely on firebaseUser from context
import { auth } from '../../firebase.js'; // Adjust path as needed
// Import only the necessary auth function
import { sendEmailVerification } from 'firebase/auth';
// REMOVE: Firestore imports are no longer needed here
// import { doc, setDoc } from 'firebase/firestore';
// import { db } from '../../firebase.js';
import { motion } from 'framer-motion';
// Import useUser hook
import { useUser } from '../../contexts/UserContext.jsx'; // Adjust path as needed
import login_background from '../../assets/login_background.png'; // Adjust path as needed

function VerifyEmailPage() {
  // Destructure firebaseUser, userData, loading from context
  const { firebaseUser, userData, loading } = useUser();
  // Keep local state variables as they were
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  // UPDATE: Redirect logic based on firebaseUser status
  useEffect(() => {
    if (!loading) {
      if (firebaseUser?.emailVerified) {
        // If Firebase user exists and email is verified, go to dashboard
        console.log('VerifyEmailPage: Redirecting to /dashboard (verified)');
        navigate('/home', { replace: true });
      } else if (!firebaseUser) {
        // If no Firebase user and not loading, redirect to login
        console.log('VerifyEmailPage: Redirecting to /login (no firebaseUser)');
        navigate('/login', { replace: true });
      }
      // If firebaseUser exists but is not verified, stay on this page
    }
    // Note: We don't redirect based on userData directly here anymore,
    // rely on firebaseUser for auth state and verification status.
  }, [firebaseUser, loading, navigate]);


  // Keep original cooldown timer effect
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // UPDATE: Use firebaseUser from context
  const handleResendEmail = async () => {
    // Use firebaseUser from context instead of auth.currentUser
    const user = firebaseUser;
    if (!user) {
      setError('No user is signed in. Please sign up or log in again.');
      return;
    }

    try {
      await sendEmailVerification(user);
      setMessage('Verification email resent. Please check your inbox or spam folder.');
      setError('');
      setIsResendDisabled(true);
      setCooldown(60); // Start 60-second cooldown
    } catch (err) {
      console.error('Resend email error:', err.code, err.message);
      if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a few minutes before trying again.');
      } else {
        setError('Failed to resend verification email: ' + err.message);
      }
      setMessage('');
    }
  };

  // UPDATE: Use firebaseUser and remove Firestore logic
  const handleCheckVerification = async () => {
    // Use firebaseUser from context instead of auth.currentUser
    const user = firebaseUser;
     if (!user) {
      setError('No user is signed in. Please sign up or log in again.');
      return;
    }

    setError(''); // Clear previous errors

    try {
      // Reload user to get updated emailVerified status from Firebase servers
      await user.reload();

      // Re-check the emailVerified status *after* reload
      if (user.emailVerified) {
        setMessage('Email verified successfully! Redirecting...');
        // REMOVED: Firestore write logic - UserContext handles DB sync
        // await setDoc(doc(db, 'users', user.uid), { ... });

        // Navigate to dashboard after verification is confirmed
        // A slight delay might allow UserContext to fetch updated userData if needed,
        // but the redirect in useEffect should also catch the verified state.
        setTimeout(() => navigate('/home'), 500);
      } else {
        setError('Email is not yet verified. Please check your email and click the verification link.');
      }
    } catch (err) {
      console.error('Verification check error:', err.code, err.message);
      setError('Error checking verification status: ' + err.message);
    }
  };

  // Loading state UI with theme colors
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary font-poppins">
        <div
          className="w-10 h-10 border-4 border-t-accent-primary border-text-secondary/20 rounded-full animate-spin"
          role="status"
          aria-live="polite"
          aria-label="Loading"
        ></div>
      </div>
    );
  }

  // --- RETURN JSX (Keep original structure and UI) ---
  return (
    <div className="min-h-screen flex font-poppins w-full h-screen overflow-hidden">
      {/* Left Image Section */}
      <div className="w-1/2 h-full bg-bg-primary p-4 hidden md:flex items-center justify-center transition-none min-w-0 flex-shrink-0">
        <img
          src={login_background}
          alt="Decorative verify email background"
          className="w-full h-full object-cover rounded-lg scale-100 transition-none"
        />
      </div>

      {/* Right Content Section */}
       <motion.div
        className="w-full md:w-1/2 h-full flex items-center justify-center px-6 sm:px-12 bg-bg-primary min-w-0 flex-shrink-0 overflow-y-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="w-full max-w-md mx-auto">
          <motion.h2
            className="text-4xl sm:text-5xl font-bold text-text-primary mb-4 sm:mb-6 text-center"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.0rem)' }} // Adjusted clamp
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Verify Your Email
          </motion.h2>

          <motion.p
            className="mt-2 sm:mt-3 mb-6 sm:mb-8 text-center text-sm text-text-secondary"
            style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.95rem)' }} // Adjusted clamp
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            A verification email has been sent to{' '}
            <strong className="text-text-primary">{firebaseUser?.email || 'your email address'}</strong>.
            Please check your inbox or spam folder and click the link inside.
          </motion.p>

          {/* Error display with theme colors */}
          {error && (
            <motion.p
              className="text-error text-sm mb-4 text-center"
              initial={{ opacity: 0, y: -10 }} // Use y instead of x
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              role="alert"
            >
              {error}
            </motion.p>
          )}

          {/* Success message display with theme colors */}
          {message && (
            <motion.p
              className="text-success text-sm mb-4 text-center"
              initial={{ opacity: 0, y: -10 }} // Use y instead of x
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              role="status"
            >
              {message}
            </motion.p>
          )}

           {/* Keep original button layout */}
          <div className="space-y-4">
            <button
              type="button"
              className={`w-full p-2.5 sm:p-3 rounded-md font-semibold text-text-primary transition-colors duration-200 ${
                isResendDisabled
                  ? 'bg-border-primary cursor-not-allowed text-text-secondary'
                  : 'bg-accent-primary hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary focus:ring-accent-primary'
              }`}
              onClick={handleResendEmail}
              disabled={isResendDisabled}
              aria-label={isResendDisabled ? `Resend email in ${cooldown} seconds` : 'Resend verification email'}
            >
              {isResendDisabled ? `Resend Email (${cooldown}s)` : 'Resend Verification Email'}
            </button>

            <button
              type="button"
              className="w-full bg-bg-tertiary text-text-primary p-2.5 sm:p-3 rounded-md font-semibold hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary focus:ring-accent-primary transition-colors duration-200"
              onClick={handleCheckVerification}
              aria-label="Check if email has been verified"
            >
              I've Verified My Email
            </button>
          </div>

          {/* Login link with theme colors */}
          <motion.p
            className="mt-6 text-center text-xs sm:text-sm text-text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Already verified?{' '}
            <Link to="/login" className="underline font-semibold text-accent-primary hover:text-accent-hover">
              Log In
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

export default VerifyEmailPage;