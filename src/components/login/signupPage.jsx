// src/views/SignUpPageView.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile, // Renamed to avoid confusion
  sendEmailVerification,
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider, db } from '../../firebase.js'; // Assuming db is your Firestore instance
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useUser } from '../../contexts/UserContext.jsx';
import login_background from '../../assets/login_background.webp';

export default function SignUpPageView() {
  const {
    firebaseUser,
    loading: contextLoading,
    error: contextError,
    createUserError: contextCreateUserError
  } = useUser();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [authError, setAuthError] = useState('');

  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (!contextLoading && firebaseUser) {
      navigate(firebaseUser.emailVerified ? '/dashboard' : '/verify-email', { replace: true });
    }
  }, [firebaseUser, contextLoading, navigate]);

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isValidName = (name) => /^[A-Za-z\s-]{1,50}$/.test(name);

  const handleFirstNameChange = (value) => {
    setFirstName(value);
    if (!value) setFirstNameError('Please fill in this field');
    else if (!isValidName(value)) setFirstNameError('Only letters, spaces, hyphens allowed (max 50).');
    else setFirstNameError('');
  };

  const handleLastNameChange = (value) => {
    setLastName(value);
    if (!value) setLastNameError('Please fill in this field');
    else if (!isValidName(value)) setLastNameError('Only letters, spaces, hyphens allowed (max 50).');
    else setLastNameError('');
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (!value) setEmailError('Please fill in this field');
    else if (!isValidEmail(value)) setEmailError('Incorrect email format');
    else setEmailError('');
    setAuthError('');
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    const updatedChecks = {
      length: val.length >= 8,
      uppercase: /[A-Z]/.test(val),
      lowercase: /[a-z]/.test(val),
      number: /\d/.test(val),
      specialChar: /[^A-Za-z0-9]/.test(val),
    };
    setPasswordChecks(updatedChecks);

    if (!val) {
        setPasswordError('Please fill in this field');
    } else if (!Object.values(updatedChecks).every(Boolean)) {
        setPasswordError('Password does not meet all requirements.');
    } else {
        setPasswordError('');
    }

    if (confirmPassword && val !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
    } else if (confirmPassword) {
        setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (val) => {
    setConfirmPassword(val);
    if (!val) setConfirmPasswordError('Please fill in this field');
    else if (val !== password) setConfirmPasswordError('Passwords do not match');
    else setConfirmPasswordError('');
  };

  const getPasswordStrength = () => {
    const score = Object.values(passwordChecks).filter(Boolean).length;
    if (password.length === 0 && score === 0) return { width: '0%', color: 'transparent' };
    if (score <= 2) return { width: `${(score / 5) * 100}%`, color: '#ef4444' }; // red-500
    if (score <= 4) return { width: `${(score / 5) * 100}%`, color: '#f97316' }; // orange-500
    return { width: '100%', color: '#22c55e' }; // green-500
  };
  const passwordStrengthStyle = getPasswordStrength();

  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthError('');

    handleFirstNameChange(firstName);
    handleLastNameChange(lastName);
    handleEmailChange(email);
    handlePasswordChange(password);
    handleConfirmPasswordChange(confirmPassword);

    const allPasswordChecksMet = Object.values(passwordChecks).every(Boolean);
    if (!allPasswordChecksMet && password) { // Ensure password error is set if checks fail
        setPasswordError('Password does not meet all requirements');
    }


    if (firstNameError || lastNameError || emailError || passwordError || confirmPasswordError || !allPasswordChecksMet || (password && password !== confirmPassword)) {
      return;
    }

    try {
      if (db) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0].data();
          if (userDoc.provider === 'google') {
            setPopupType('google-provider');
            setShowPopup(true);
            return;
          } else {
            setAuthError('This email is already registered. Please log in or use a different email.');
            return;
          }
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateFirebaseProfile(user, {
        displayName: `${firstName} ${lastName}`.trim(),
      });

      await sendEmailVerification(user);
      navigate('/verify-email');

    } catch (err) {
      console.error('Sign-up error:', err.code, err.message);
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('This email is already registered with Firebase. Please log in or use a different email.');
      } else if (err.code === 'permission-denied' && db) {
        console.error('Firestore permission denied:', err);
        setAuthError('Unable to verify account details. Please try again.');
      } else {
        setAuthError(err.message || 'Failed to sign up. Please try again.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    try {
      setShowPopup(false);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user.displayName || user.displayName.trim() === '' || user.displayName.toLowerCase() === 'user') {
        const nameFromEmail = user.email ? user.email.split('@')[0] : 'New User';
        await updateFirebaseProfile(user, { displayName: nameFromEmail });
      }
      // Redirection handled by useEffect
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in process was cancelled.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
         setAuthError('An account already exists with this email. Please sign in using the original method.');
      } else {
        setAuthError(err.message || 'Failed to sign in with Google.');
      }
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

  if (contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2c2638] font-poppins">
        <div
          className="w-10 h-10 border-4 border-t-[#9674da] border-[#ffffff33] rounded-full animate-spin"
          role="status"
          aria-live="polite"
          aria-label="Loading"
        ></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-poppins w-full h-screen overflow-hidden">
      <div className="w-full md:w-1/2 h-full bg-[#2c2638] p-4 hidden md:flex items-center justify-center transition-none min-w-0 flex-shrink-0">
        <img
          src={login_background}
          alt="Decorative signup background"
          className="w-full h-full object-cover rounded-lg scale-100 transition-none"
        />
      </div>

      <motion.div
        className="w-full md:w-1/2 h-full flex flex-col justify-center px-6 sm:px-12 bg-[#2c2638] min-w-0 flex-shrink-0 overflow-y-auto py-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.h2
          className="text-4xl sm:text-5xl font-bold text-white mb-4 sm:mb-6 text-center"
          style={{ fontSize: 'clamp(2.2rem, 5vw, 3.0rem)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Sign Up
        </motion.h2>

        <motion.p
          className="mt-2 sm:mt-3 mb-6 sm:mb-8 text-center text-xs sm:text-sm text-white"
          style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Already have an account?{' '}
          <Link to="/login" className="underline font-bold text-[#9674da]">
            Log In
          </Link>
        </motion.p>

        {authError && (
          <motion.p
            className="text-red-400 text-sm mb-4 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            role="alert"
          >
            {authError}
          </motion.p>
        )}
        {contextCreateUserError && !authError && (
          <motion.p
            className="text-red-400 text-sm mb-4 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            role="alert"
          >
            Error creating profile on backend: {contextCreateUserError}
          </motion.p>
        )}
        {contextError && !authError && !contextCreateUserError && (
          <motion.p
            className="text-red-400 text-sm mb-4 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            role="alert"
          >
            System error: {contextError}
          </motion.p>
        )}

        <form onSubmit={handleSignup} className="space-y-3 sm:space-y-4 w-full max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <label htmlFor="firstName" className="block text-base sm:text-lg font-medium text-white text-left">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => handleFirstNameChange(e.target.value)}
                className="mt-1 w-full p-2 bg-[#3a3942] text-white border border-[#4a4952] rounded-md focus:outline-none focus:ring-2 focus:ring-[#9674da] disabled:opacity-70"
                aria-describedby={firstNameError ? 'firstName-error' : undefined}
                disabled={contextLoading}
              />
              {firstNameError && (
                <motion.p
                  id="firstName-error"
                  className="text-red-400 text-xs mt-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  role="alert"
                >
                  {firstNameError}
                </motion.p>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="lastName" className="block text-base sm:text-lg font-medium text-white text-left">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => handleLastNameChange(e.target.value)}
                className="mt-1 w-full p-2 bg-[#3a3942] text-white border border-[#4a4952] rounded-md focus:outline-none focus:ring-2 focus:ring-[#9674da] disabled:opacity-70"
                aria-describedby={lastNameError ? 'lastName-error' : undefined}
                disabled={contextLoading}
              />
              {lastNameError && (
                <motion.p
                  id="lastName-error"
                  className="text-red-400 text-xs mt-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  role="alert"
                >
                  {lastNameError}
                </motion.p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-base sm:text-lg font-medium text-white text-left">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className="mt-1 w-full p-2 bg-[#3a3942] text-white border border-[#4a4952] rounded-md focus:outline-none focus:ring-2 focus:ring-[#9674da] disabled:opacity-70"
              aria-describedby={emailError ? 'email-error' : undefined}
              disabled={contextLoading}
            />
            {emailError && (
              <motion.p
                id="email-error"
                className="text-red-400 text-xs mt-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                role="alert"
              >
                {emailError}
              </motion.p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-base sm:text-lg font-medium text-white text-left">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="mt-1 w-full p-2 bg-[#3a3942] text-white border border-[#4a4952] rounded-md focus:outline-none focus:ring-2 focus:ring-[#9674da] disabled:opacity-70"
              aria-describedby={passwordError ? 'password-error' : undefined}
              disabled={contextLoading}
            />
            {passwordError && (
              <motion.p
                id="password-error"
                className="text-red-400 text-xs mt-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                role="alert"
              >
                {passwordError}
              </motion.p>
            )}
            {password && (
              <>
                <div className="w-full h-1.5 sm:h-2 mt-2 bg-[#4a4952] rounded-full overflow-hidden">
                  <motion.div
                    style={{
                      width: passwordStrengthStyle.width,
                      backgroundColor: passwordStrengthStyle.color,
                    }}
                    className="h-full rounded-full transition-all duration-300"
                    initial={{ width: '0%' }}
                    animate={{ width: passwordStrengthStyle.width }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <motion.div
                  className="mt-1.5 flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-1 text-[0.7rem] sm:text-xs text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <span className={passwordChecks.uppercase ? 'text-green-400' : 'text-red-400'}>{passwordChecks.uppercase ? '✓' : '✗'} Uppercase</span>
                  <span className={passwordChecks.lowercase ? 'text-green-400' : 'text-red-400'}>{passwordChecks.lowercase ? '✓' : '✗'} Lowercase</span>
                  <span className={passwordChecks.number ? 'text-green-400' : 'text-red-400'}>{passwordChecks.number ? '✓' : '✗'} Number</span>
                  <span className={passwordChecks.specialChar ? 'text-green-400' : 'text-red-400'}>{passwordChecks.specialChar ? '✓' : '✗'} Special</span>
                  <span className={passwordChecks.length ? 'text-green-400' : 'text-red-400'}>{passwordChecks.length ? '✓' : '✗'} 8+ Chars</span>
                </motion.div>
              </>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-base sm:text-lg font-medium text-white text-left">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              className="mt-1 w-full p-2 bg-[#3a3942] text-white border border-[#4a4952] rounded-md focus:outline-none focus:ring-2 focus:ring-[#9674da] disabled:opacity-70"
              aria-describedby={confirmPasswordError ? 'confirmPassword-error' : undefined}
              disabled={contextLoading}
            />
            {confirmPasswordError && (
              <motion.p
                id="confirmPassword-error"
                className="text-red-400 text-xs mt-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                role="alert"
              >
                {confirmPasswordError}
              </motion.p>
            )}
          </div>

          <motion.div
            className="flex items-center space-x-2 pt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <input
              type="checkbox"
              id="terms"
              required
              className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#9674da] border-[#4a4952] rounded focus:ring-offset-0 focus:ring-2 focus:ring-[#9674da] bg-[#3a3942] disabled:opacity-70 appearance-none checked:bg-[#9674da] checked:border-transparent"
              aria-label="Agree to Terms & Conditions"
              disabled={contextLoading}
            />
            <label htmlFor="terms" className="text-xs sm:text-sm text-white">
              I agree to the{' '}
              <a
                href="/terms" // Replace with your actual terms page link
                className="underline text-[#9674da] hover:text-[#7e5cb7]"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms & Conditions
              </a>
            </label>
          </motion.div>

          <motion.button
            type="submit"
            className="w-full bg-[#9674da] text-white p-2.5 sm:p-3 rounded-md font-semibold hover:bg-[#7e5cb7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#2c2638] focus:ring-[#9674da] disabled:opacity-50"
            whileHover={!contextLoading ? { scale: 1.02 } : {}}
            whileTap={!contextLoading ? { scale: 0.98 } : {}}
            disabled={contextLoading}
            aria-label="Sign up with email and password"
          >
            {contextLoading ? 'Processing...' : 'Sign Up'}
          </motion.button>

          <motion.div
            className="flex items-center my-4 sm:my-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            <div className="flex-grow border-t border-gray-600" />
            <span className="mx-3 sm:mx-4 text-xs sm:text-sm text-gray-400">or sign up with</span>
            <div className="flex-grow border-t border-gray-600" />
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.3 }}
          >
            <motion.button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 bg-[#3a3942] text-white py-2 px-3 sm:px-4 rounded-md font-semibold hover:bg-[#4a4952] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#2c2638] focus:ring-[#9674da] disabled:opacity-50"
              whileHover={!contextLoading ? { scale: 1.02 } : {}}
              whileTap={!contextLoading ? { scale: 0.98 } : {}}
              disabled={contextLoading}
              aria-label="Sign up with Google"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google logo"
                className="w-5 h-5"
              />
              {contextLoading ? 'Processing...' : 'Google'}
            </motion.button>
            <motion.button
              type="button"
              onClick={handleAppleSignIn}
              className="w-full flex items-center justify-center gap-2 bg-[#3a3942] text-white py-2 px-3 sm:px-4 rounded-md font-semibold hover:bg-[#4a4952] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#2c2638] focus:ring-[#9674da] disabled:opacity-50"
              whileHover={!contextLoading ? { scale: 1.02 } : {}}
              whileTap={!contextLoading ? { scale: 0.98 } : {}}
              disabled={contextLoading}
              aria-label="Sign up with Apple"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg"
                alt="Apple logo"
                className="w-5 h-5 filter brightness-0 invert" // Ensure Apple logo is white
              />
              {contextLoading ? 'Processing...' : 'Apple'}
            </motion.button>
          </motion.div>
        </form>

        {showPopup && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              className="bg-[#353142] border-2 border-[#4a4952] p-6 sm:p-8 rounded-lg max-w-xs sm:max-w-sm w-full shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {popupType === 'google-provider' ? (
                <>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 text-center">
                    Google Sign-In Recommended
                  </h3>
                  <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6 text-center">
                    This email address seems to be associated with a Google account. For a smoother experience, please sign up or log in using the Google button.
                  </p>
                  <motion.button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 bg-[#4285F4] text-white py-2.5 px-4 rounded-md font-semibold hover:bg-[#3578E5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#353142] focus:ring-[#4285F4]"
                    onClick={handleGoogleSignIn}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    aria-label="Sign in with Google"
                    disabled={contextLoading}
                  >
                    <img
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      alt="Google logo"
                      className="w-5 h-5"
                    />
                    {contextLoading ? 'Processing...' : 'Use Google Sign-In'}
                  </motion.button>
                  <motion.button
                    type="button"
                    className="w-full mt-3 text-sm text-gray-400 hover:text-white underline"
                    onClick={closePopup}
                    aria-label="Cancel Google sign-in"
                     disabled={contextLoading}
                  >
                    Cancel
                  </motion.button>
                </>
              ) : popupType === 'apple' ? (
                <>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 text-center">
                    Apple Sign-In Not Available
                  </h3>
                  <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6 text-center">
                    We are still working on setting up Apple sign-in. For now, please use Google or create an account with email.
                  </p>
                  <motion.button
                    type="button"
                    className="w-full bg-[#9674da] text-white py-2.5 px-4 rounded-md font-semibold hover:bg-[#7e5cb7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#353142] focus:ring-[#9674da]"
                    onClick={closePopup}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    aria-label="Close Apple sign-in popup"
                     disabled={contextLoading}
                  >
                    Exit
                  </motion.button>
                </>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}