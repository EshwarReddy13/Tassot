// src/views/LoginPageView.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../../firebase.js';
import { motion } from 'framer-motion';
import { useUser } from '../../contexts/UserContext.jsx';
import login_background from '../../assets/login_background.png';

export default function LoginPageView() {
  const { firebaseUser } = useUser();
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [emailError, setEmailError]     = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError]       = useState('');
  const [showPopup, setShowPopup]       = useState(false);
  const [popupType, setPopupType]       = useState(''); // only used for Apple

  const navigate = useNavigate();

  // Redirect once we have a signed-in user
  useEffect(() => {
    if (firebaseUser) {
      navigate(
        firebaseUser.emailVerified ? '/home' : '/verify-email',
        { replace: true }
      );
    }
  }, [firebaseUser, navigate]);

  const isValidEmail = (em) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);

  const handleEmailChange = (val) => {
    setEmail(val);
    if (!val) setEmailError('Please fill in this field');
    else if (!isValidEmail(val)) setEmailError('Incorrect email format');
    else setEmailError('');
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    setPasswordError(val ? '' : 'Please fill in this field');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    let hasError = false;

    if (!email) {
      setEmailError('Please fill in this field');
      hasError = true;
    } else if (!isValidEmail(email)) {
      setEmailError('Incorrect email format');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Please fill in this field');
      hasError = true;
    }

    if (hasError) return;

    try {
      setAuthError('');
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect handled in useEffect
    } catch (err) {
      console.error('Login error:', err.code, err.message);
      if (
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setAuthError('Invalid email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setAuthError('Too many attempts. Please try again later.');
      } else {
        setAuthError(err.message || 'Failed to sign in.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthError('');
      setShowPopup(false);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (!user.displayName) {
        await updateProfile(user, { displayName: 'User' });
      }
      // UserProvider will upsert & fetch your profile
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setAuthError(err.message || 'Failed to sign in with Google');
    }
  };

  const handleAppleSignIn = () => {
    setPopupType('apple');
    setShowPopup(true);
    setAuthError('');
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupType('');
  };

  return (
    <div className="min-h-screen flex font-poppins w-full h-screen overflow-hidden">

      {/* Left Form Section */}
      <motion.div
        className="w-1/2 h-full flex flex-col justify-center px-8 bg-bg-primary min-w-0 flex-shrink-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.h2
          className="text-5xl font-bold text-text-primary mb-6 text-center"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Log In
        </motion.h2>

        <motion.p
          className="mt-3 mb-8 text-center text-sm text-text-secondary"
          style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Don't have an account?{' '}
          <Link to="/signup" className="underline font-bold text-accent-primary">
            Sign Up
          </Link>
        </motion.p>

        {authError && (
          <motion.p
            className="text-error text-sm mb-4 text-center"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            role="alert"
          >
            {authError}
          </motion.p>
        )}

        <form onSubmit={handleLogin} className="space-y-4 w-full max-w-md mx-auto">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xl font-medium text-text-primary text-left"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className="mt-1 w-full p-2 bg-bg-secondary text-text-primary border border-[#4a4952] rounded-md focus:outline-none focus:ring-2 focus:ring-[#9674da]"
              aria-describedby={emailError ? 'email-error' : undefined}
            />
            {emailError && (
              <motion.p
                id="email-error"
                className="text-red-400 text-sm mt-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                role="alert"
              >
                {emailError}
              </motion.p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xl font-medium text-text-primary text-left"
            >
              
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="mt-1 w-full p-2 bg-[#3a3942] text-text-primary border border-[#4a4952] rounded-md focus:outline-none focus:ring-2 focus:ring-[#9674da]"
              aria-describedby={passwordError ? 'password-error' : undefined}
            />
            {passwordError && (
              <motion.p
                id="password-error"
                className="text-red-400 text-sm mt-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                role="alert"
              >
                {passwordError}
              </motion.p>
            )}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            className="w-full bg-accent-primary text-text-primary p-2 rounded-md font-semibold hover:bg-[#7e5cb7] focus:outline-none focus:ring-2 focus:ring-[#9674da]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Log in with email and password"
          >
            Log In
          </motion.button>

          {/* Divider */}
          <motion.div
            className="flex items-center my-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <div className="flex-grow border-t border-gray-600" />
            <span className="mx-4 text-sm text-gray-400">or sign in with</span>
            <div className="flex-grow border-t border-gray-600" />
          </motion.div>

          {/* OAuth Buttons Row */}
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            {/* Google */}
            <motion.button
              type="button"
              className="w-1/2 flex items-center justify-center gap-2 bg-[#3a3942] text-text-primary py-2 rounded-md font-semibold hover:bg-[#7e5cb7] focus:outline-none focus:ring-2 focus:ring-[#9674da]"
              onClick={handleGoogleSignIn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Sign in with Google"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google logo"
                className="w-5 h-5"
              />
              Google
            </motion.button>

            {/* Apple */}
            <motion.button
              type="button"
              className="w-1/2 flex items-center justify-center gap-2 bg-[#3a3942] text-text-primary py-2 rounded-md font-semibold hover:bg-[#7e5cb7] focus:outline-none focus:ring-2 focus:ring-[#9674da]"
              onClick={handleAppleSignIn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Sign in with Apple"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg"
                alt="Apple logo"
                className="w-5 h-5"
              />
              Apple
            </motion.button>
          </motion.div>
        </form>

        {/* Popup Modal */}
        {showPopup && (
          <motion.div
            className="fixed inset-0 bg-[#000]/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              className="bg-[#2c2638] border-2 border-[#3a3942] p-10 rounded-lg max-w-sm w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {popupType === 'apple' && (
                <>
                  <h3 className="text-xl font-bold text-text-primary mb-4 text-center">
                    Apple Sign-In Not Available
                  </h3>
                  <p className="text-text-secondary text-sm mb-6 text-center">
                    We are still working on setting up Apple sign-in. For now, use
                    Google or email.
                  </p>
                  <motion.button
                    type="button"
                    className="w-full bg-[#9674da] text-text-primary py-2 rounded-md font-semibold hover:bg-[#7e5cb7] focus:outline-none focus:ring-2 focus:ring-[#9674da]"
                    onClick={closePopup}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Close Apple sign-in popup"
                  >
                    Exit
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Right Image Section */}
      <div className="w-1/2 h-full bg-bg-primary p-2 flex items-center justify-center transition-none min-w-0 flex-shrink-0">
        <img
          src={login_background}
          alt="Decorative login background"
          className="w-full h-full object-cover rounded-lg scale-100 transition-none"
        />
      </div>

      
    </div>
  );
}
