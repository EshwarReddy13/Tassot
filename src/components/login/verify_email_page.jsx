import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useUser } from '../global widgets/user_provider.jsx';
import login_background from '../../assets/login_background.webp';

function VerifyEmailPage() {
  const { userData, loading } = useUser();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  // Redirect if already verified or not logged in
  if (!loading && userData) {
    if (userData.emailVerified) {
      navigate('/dashboard', { replace: true });
      return null;
    }
  } else if (!loading && !userData) {
    navigate('/login', { replace: true });
    return null;
  }

  // Cooldown timer effect
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

  const handleResendEmail = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setMessage('Verification email resent. Please check your inbox or spam folder.');
        setError('');
        // Start 60-second cooldown
        setIsResendDisabled(true);
        setCooldown(60);
      } else {
        setError('No user is signed in. Please sign up or log in again.');
      }
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

  const handleCheckVerification = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Reload user to get updated emailVerified status
        await user.reload();
        if (user.emailVerified) {
          // Extract firstName and lastName from displayName
          const displayName = user.displayName || 'User';
          const [firstName, lastName = ''] = displayName.split(' ');
          // Determine provider from providerData
          const providerData = user.providerData || [];
          const provider = providerData.some((data) => data.providerId === 'google.com')
            ? 'google'
            : 'email';

          // Add user to Firestore 'users' collection with provider
          await setDoc(doc(db, 'users', user.uid), {
            firstName,
            lastName,
            email: user.email,
            provider,
          });

          // Navigate to dashboard after successful Firestore write
          navigate('/dashboard');
        } else {
          setError('Email is not yet verified. Please check your email.');
        }
      } else {
        setError('No user is signed in. Please sign up or log in again.');
      }
    } catch (err) {
      console.error('Verification error:', err.code, err.message);
      if (err.code === 'firestore/permission-denied' || err.code.includes('firestore')) {
        setError('Failed to save user data. Please try again.');
      } else {
        setError('Error: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1f1e25] font-poppins">
        <div
          className="w-[2.5rem] h-[2.5rem] border-[0.25rem] border-t-[#9674da] border-[#ffffff33] rounded-full animate-spin"
          role="status"
          aria-live="polite"
          aria-label="Loading"
        ></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-poppins w-full h-screen overflow-hidden">
      {/* Left Image Section */}
      <div className="w-1/2 h-full bg-[#2c2638] p-4 flex items-center justify-center transition-none min-w-0 flex-shrink-0">
        <img
          src={login_background}
          alt="Decorative verify email background"
          className="w-full h-full object-cover rounded-lg scale-100 transition-none"
        />
      </div>

      {/* Right Content Section */}
      <motion.div
        className="w-1/2 h-full flex items-center justify-center px-12 bg-[#2c2638] min-w-0 flex-shrink-0 overflow-y-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="w-full max-w-md mx-auto">
          <motion.h2
            className="text-5xl font-bold text-white mb-6 text-center"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Verify Your Email
          </motion.h2>

          <motion.p
            className="mt-3 mb-8 text-center text-sm text-white"
            style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            A verification email has been sent to your email address. Please check your inbox or spam folder and follow the link to verify your email.
          </motion.p>

          {error && (
            <motion.p
              className="text-red-400 text-sm mb-4 text-center"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              role="alert"
            >
              {error}
            </motion.p>
          )}

          {message && (
            <motion.p
              className="text-green-400 text-sm mb-4 text-center"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              role="status"
            >
              {message}
            </motion.p>
          )}

          <div className="space-y-4">
            <button
              type="button"
              className={`w-full p-2 rounded-md font-bold text-white ${
                isResendDisabled
                  ? 'bg-[#2c2638] outline-1 outline-[#9500ff]'
                  : 'bg-[#9674da] hover:bg-[#7f5fb7] focus:outline-none focus:ring-2 focus:ring-[#9500ff]'
              }`}
              onClick={handleResendEmail}
              disabled={isResendDisabled}
              aria-label={isResendDisabled ? `Resend email in ${cooldown} seconds` : 'Resend verification email'}
            >
              {isResendDisabled ? `Resend Email (${cooldown}s)` : 'Resend Verification Email'}
            </button>

            <button
              type="button"
              className="w-full bg-[#9674da] text-white p-2 rounded-md font-bold hover:bg-[#7f5fb7] focus:outline-none focus:ring-2 focus:ring-[#9500ff]"
              onClick={handleCheckVerification}
              aria-label="Check email verification status"
            >
              I've Verified My Email
            </button>
          </div>

          <motion.p
            className="mt-6 text-center text-sm text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Already verified?{' '}
            <Link to="/login" className="underline font-bold text-[#9500ff]">
              Log In
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

export default VerifyEmailPage;