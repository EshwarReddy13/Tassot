/**
 * LoginPageView Component
 * 
 * A comprehensive login page that provides multiple authentication methods:
 * - Email/password authentication
 * - Google OAuth sign-in
 * - Apple sign-in (placeholder for future implementation)
 * 
 * Features:
 * - Real-time form validation
 * - Error handling and user feedback
 * - Responsive design with animations
 * - Accessibility compliance
 * - Automatic redirection based on user state
 * 
 * @component
 * @returns {JSX.Element} The login page component
 */
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
import AuthBrandHeader from './AuthBrandHeader.jsx';

export default function LoginPageView() {
  // Get current user from context
  const { firebaseUser } = useUser();
  
  // Form state management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Error state management
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Modal/popup state management
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(''); // Currently only used for Apple sign-in popup

  const navigate = useNavigate();

  /**
   * Effect to handle automatic redirection based on user authentication state
   * Redirects to home page if email is verified, otherwise to email verification page
   */
  useEffect(() => {
    if (firebaseUser) {
      navigate(
        firebaseUser.emailVerified ? '/home' : '/verify-email',
        { replace: true }
      );
    }
  }, [firebaseUser, navigate]);

  /**
   * Validates email format using regex pattern
   * @param {string} em - Email address to validate
   * @returns {boolean} True if email format is valid, false otherwise
   */
  const isValidEmail = (em) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);

  /**
   * Handles email input changes with real-time validation
   * Updates email state and validates format, clearing or setting error messages
   * @param {string} val - The new email value
   */
  const handleEmailChange = (val) => {
    setEmail(val);
    if (!val) {
      setEmailError('Please fill in this field');
    } else if (!isValidEmail(val)) {
      setEmailError('Incorrect email format');
    } else {
      setEmailError('');
    }
  };

  /**
   * Handles password input changes with basic validation
   * Updates password state and validates presence, clearing or setting error messages
   * @param {string} val - The new password value
   */
  const handlePasswordChange = (val) => {
    setPassword(val);
    setPasswordError(val ? '' : 'Please fill in this field');
  };

  /**
   * Handles form submission for email/password authentication
   * Validates form inputs and attempts to sign in with Firebase
   * Provides user-friendly error messages for different failure scenarios
   * @param {Event} e - Form submission event
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    let hasError = false;

    // Validate email field
    if (!email) {
      setEmailError('Please fill in this field');
      hasError = true;
    } else if (!isValidEmail(email)) {
      setEmailError('Incorrect email format');
      hasError = true;
    }

    // Validate password field
    if (!password) {
      setPasswordError('Please fill in this field');
      hasError = true;
    }

    // Return early if validation fails
    if (hasError) return;

    try {
      setAuthError('');
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect is handled automatically by useEffect when firebaseUser changes
    } catch (err) {
      console.error('Login error:', err.code, err.message);
      
      // Provide user-friendly error messages based on Firebase error codes
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

  /**
   * Handles Google OAuth sign-in process
   * Opens Google sign-in popup and handles user profile creation
   * Sets default display name if none is provided by Google
   */
  const handleGoogleSignIn = async () => {
    try {
      setAuthError('');
      setShowPopup(false);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Set default display name if Google doesn't provide one
      if (!user.displayName) {
        await updateProfile(user, { displayName: 'User' });
      }
      // UserProvider will handle profile creation and data fetching
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setAuthError(err.message || 'Failed to sign in with Google');
    }
  };

  /**
   * Handles Apple sign-in button click
   * Currently shows a placeholder popup as Apple sign-in is not implemented
   * TODO: Implement actual Apple sign-in functionality
   */
  const handleAppleSignIn = () => {
    setPopupType('apple');
    setShowPopup(true);
    setAuthError('');
  };

  /**
   * Closes the modal popup and resets popup state
   */
  const closePopup = () => {
    setShowPopup(false);
    setPopupType('');
  };

  return (
    <>
      <AuthBrandHeader />
      <div className="min-h-screen flex font-poppins w-full h-screen overflow-hidden">
        {/* 
          Main container with split layout:
          - Left side: Login form with animations
          - Right side: Decorative background image
        */}

        {/* Left Form Section - Contains login form and authentication options */}
        <motion.div
          className="w-full md:w-1/2 h-full flex flex-col justify-center px-6 sm:px-12 bg-bg-primary min-w-0 flex-shrink-0 overflow-y-auto py-8 mt-20 md:mt-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Page Title - Animated entrance with responsive font sizing */}
          <motion.h2
            className="text-5xl font-bold text-text-primary mb-6 text-center"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Log In
          </motion.h2>

          {/* Sign Up Link - Animated entrance with link to registration page */}
          <motion.p
            className="mb-10 text-center text-sm text-text-secondary"
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

          {/* Authentication Error Display - Shows Firebase auth errors with animation */}
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

          {/* Login Form - Email/password authentication with validation */}
          <form onSubmit={handleLogin} className="space-y-4 w-full max-w-md mx-auto">
            {/* Email Input Field - With real-time validation */}
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
                className="mt-1 w-full p-2 bg-bg-tertiary text-text-primary border border-[#4a4952] rounded-md focus:outline-none focus:ring-2 focus:ring-[#9674da]"
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

            {/* Password Input Field - With basic validation */}
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
                className="mt-1 w-full p-2 bg-bg-tertiary text-text-primary border border-[#4a4952] rounded-md focus:outline-none focus:ring-2 focus:ring-[#9674da]"
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

            {/* Submit Button - Email/password login with hover animations */}
            <motion.button
              type="submit"
              className="w-full mt-4 bg-accent-primary text-text-primary p-2 rounded-md font-bold hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-[#9674da]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Log in with email and password"
            >
              Log In
            </motion.button>

            {/* Divider Line - Separates email/password from OAuth options */}
            <motion.div
              className="flex items-center mt-6 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <div className="flex-grow border-t border-gray-600" />
              <span className="mx-4 text-sm text-gray-400">or sign in with</span>
              <div className="flex-grow border-t border-gray-600" />
            </motion.div>

            {/* OAuth Buttons Row - Google and Apple sign-in options */}
            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              {/* Google OAuth Button - Opens Google sign-in popup */}
              <motion.button
                type="button"
                className="w-1/2 flex items-center justify-center gap-2 bg-bg-tertiary text-text-primary py-2 rounded-md font-semibold hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-[#9674da]"
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

              {/* Apple OAuth Button - Currently shows placeholder popup */}
              <motion.button
                type="button"
                className="w-1/2 flex items-center justify-center gap-2 bg-bg-tertiary text-text-primary py-2 rounded-md font-semibold hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-[#9674da]"
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

          {/* Popup Modal - Currently used for Apple sign-in placeholder */}
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
                {/* Apple Sign-in Placeholder Content */}
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

        {/* Right Image Section - Decorative background image */}
        <div className="w-1/2 h-full bg-bg-primary p-2 flex items-center justify-center transition-none min-w-0 flex-shrink-0">
          <img
            src={login_background}
            alt="Decorative login background"
            className="w-full h-full object-cover rounded-lg scale-100 transition-none"
          />
        </div>

        
      </div>
    </>
  );
}
