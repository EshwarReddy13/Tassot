import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';

import { useUser } from '../global widgets/user_provider.jsx';

import login_background from '../../assets/login_background.webp';

function SignUpPageView() {
  const { userData, loading } = useUser();
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

  // Redirect if already logged in
  if (!loading && userData) {
    navigate(userData.emailVerified ? '/dashboard' : '/verify-email', { replace: true });
    return null;
  }

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidName = (name) => /^[A-Za-z\s-]{1,50}$/.test(name);

  const handleFirstNameChange = (value) => {
    setFirstName(value);
    if (!value) {
      setFirstNameError('Please fill in this field');
    } else if (!isValidName(value)) {
      setFirstNameError('Only letters, spaces, and hyphens allowed');
    } else {
      setFirstNameError('');
    }
  };

  const handleLastNameChange = (value) => {
    setLastName(value);
    if (!value) {
      setLastNameError('Please fill in this field');
    } else if (!isValidName(value)) {
      setLastNameError('Only letters, spaces, and hyphens allowed');
    } else {
      setLastNameError('');
    }
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (!value) {
      setEmailError('Please fill in this field');
    } else if (!isValidEmail(value)) {
      setEmailError('Incorrect email format');
    } else {
      setEmailError('');
    }
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
    if (!val) {
      setConfirmPasswordError('Please fill in this field');
    } else if (val !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const getPasswordStrength = () => {
    const score = Object.values(passwordChecks).filter(Boolean).length;
    if (score === 0) return { width: '0%', color: 'transparent' };
    if (score <= 2) return { width: '33%', color: 'red' };
    if (score <= 4) return { width: '66%', color: 'orange' };
    return { width: '100%', color: 'green' };
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    let hasError = false;

    if (!firstName) {
      setFirstNameError('Please fill in this field');
      hasError = true;
    } else if (!isValidName(firstName)) {
      setFirstNameError('Only letters, spaces, and hyphens allowed');
      hasError = true;
    }

    if (!lastName) {
      setLastNameError('Please fill in this field');
      hasError = true;
    } else if (!isValidName(lastName)) {
      setLastNameError('Only letters, spaces, and hyphens allowed');
      hasError = true;
    }

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
    } else {
      const { length, uppercase, lowercase, number, specialChar } = passwordChecks;
      if (!(length && uppercase && lowercase && number && specialChar)) {
        setPasswordError('Password does not meet all requirements');
        hasError = true;
      }
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please fill in this field');
      hasError = true;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    if (hasError) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email: user.email,
        provider: 'email',
      });
      await sendEmailVerification(user);
      setAuthError('A verification email has been sent. Please verify your email before logging in.');
      navigate('/verify-email');
    } catch (err) {
      console.error('Sign-up error:', err.code, err.message);
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('This email is already registered. Please log in or use a different email.');
      } else {
        setAuthError(err.message || 'Failed to sign up');
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
        await updateProfile(user, {
          displayName: 'User',
        });
      }
      if (user.emailVerified) {
        const displayName = user.displayName || 'User';
        const [firstName, lastName = ''] = displayName.split(' ');
        await setDoc(doc(db, 'users', user.uid), {
          firstName,
          lastName,
          email: user.email,
          provider: 'google',
        });
        navigate('/dashboard');
      } else {
        navigate('/verify-email');
      }
    } catch (err) {
      console.error('Google Sign-In Error:', err.code, err.message);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Google Sign-In was cancelled. Please try again.');
      } else {
        setAuthError(err.message || 'Failed to sign in with Google');
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

  const passwordStrength = getPasswordStrength();

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
    <div className="min-h-screen flex font-poppins w-full">
      {/* Left Image Section - Fixed */}
      <div className="fixed top-0 left-0 h-screen w-1/2 bg-[#2c2638] p-4 flex items-center justify-center transition-none">
        <img
          src={login_background}
          alt="Decorative signup background"
          className="w-full h-full object-cover rounded-lg scale-100 transition-none"
        />
      </div>

      {/* Right Form Section - Scrollable and Centered */}
      <motion.div
        className="ml-[50%] w-1/2 min-h-screen bg-[#2c2638] px-12 overflow-y-auto flex flex-col justify-center items-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="w-full max-w-md py-8">
          <motion.h2
            className="text-5xl font-bold text-white mb-6 text-center"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Sign Up
          </motion.h2>

          <motion.p
            className="mt-3 mb-8 text-center text-sm text-white"
            style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Already have an account?{' '}
            <Link to="/login" className="underline font-bold text-[#9500ff]">
              Log In
            </Link>
          </motion.p>

          {authError && (
            <motion.p
              className="text-red-400 text-sm mb-4 text-center"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              role="alert"
            >
              {authError}
            </motion.p>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* First Name and Last Name in a Row */}
            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <div className="flex-1">
                <label htmlFor="firstName" className="block text-xl font-medium text-white text-left">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => handleFirstNameChange(e.target.value)}
                  className="mt-1 w-full p-2 bg-[#3a3942] text-white border border-[#4a4952] rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500ff]"
                  aria-describedby={firstNameError ? 'firstName-error' : undefined}
                />
                {firstNameError && (
                  <motion.p
                    id="firstName-error"
                    className="text-red-400 text-sm mt-1"
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
                <label htmlFor="lastName" className="block text-xl font-medium text-white text-left">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => handleLastNameChange(e.target.value)}
                  className="mt-1 w-full p-2 bg-[#3a3942] text-white border border-[#4a4952] rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500ff]"
                  aria-describedby={lastNameError ? 'lastName-error' : undefined}
                />
                {lastNameError && (
                  <motion.p
                    id="lastName-error"
                    className="text-red-400 text-sm mt-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    role="alert"
                  >
                    {lastNameError}
                  </motion.p>
                )}
              </div>
            </motion.div>

            <div>
              <label htmlFor="email" className="block text-xl font-medium text-white text-left">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="mt-1 w-full p-2 bg-[#3a3942] text-white border border-[#4a4952] rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500ff]"
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

            <div>
              <label htmlFor="password" className="block text-xl font-medium text-white text-left">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="mt-1 w-full p-2 bg-[#3a3942] text-white border border-[#4a4952] rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500ff]"
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

              {password && (
                <>
                  <div className="w-full h-2 mt-5 bg-[#4a4952] rounded-md">
                    <motion.div
                      style={{
                        width: passwordStrength.width,
                        backgroundColor: passwordStrength.color,
                      }}
                      className="h-2 rounded-md transition-all duration-300"
                      initial={{ width: '0%' }}
                      animate={{ width: passwordStrength.width }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  <motion.div
                    className="mt-2 flex flex-wrap gap-2 text-xs text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <span className={passwordChecks.uppercase ? 'text-green-400' : 'text-red-400'}>
                      {passwordChecks.uppercase ? '✔️' : '❌'} Uppercase
                    </span>
                    <span className={passwordChecks.lowercase ? 'text-green-400' : 'text-red-400'}>
                      {passwordChecks.lowercase ? '✔️' : '❌'} Lowercase
                    </span>
                    <span className={passwordChecks.number ? 'text-green-400' : 'text-red-400'}>
                      {passwordChecks.number ? '✔️' : '❌'} Number
                    </span>
                    <span className={passwordChecks.specialChar ? 'text-green-400' : 'text-red-400'}>
                      {passwordChecks.specialChar ? '✔️' : '❌'} Special
                    </span>
                    <span className={passwordChecks.length ? 'text-green-400' : 'text-red-400'}>
                      {passwordChecks.length ? '✔️' : '❌'} 8+ chars
                    </span>
                  </motion.div>
                </>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xl font-medium text-white text-left">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                className="mt-1 w-full p-2 bg-[#3a3942] text-white border border-[#4a4952] rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500ff]"
                aria-describedby={confirmPasswordError ? 'confirmPassword-error' : undefined}
              />
              {confirmPasswordError && (
                <motion.p
                  id="confirmPassword-error"
                  className="text-red-400 text-sm mt-1"
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
              className="flex items-center space-x-2 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <input
                type="checkbox"
                id="terms"
                required
                className="form-checkbox h-4 w-4 text-[#9500ff] border-gray-300 rounded"
                aria-label="Agree to Terms & Conditions"
              />
              <label htmlFor="terms" className="text-sm text-white">
                I agree to the{' '}
                <a
                  href="/terms"
                  className="underline text-[#9500ff]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms & Conditions
                </a>
              </label>
            </motion.div>

            <button
              type="submit"
              className="w-full bg-[#9674da] text-white p-2 rounded-md font-bold hover:bg-[#7f5fb7] focus:outline-none focus:ring-2 focus:ring-[#9500ff]"
              aria-label="Sign up with email and password"
            >
              Sign Up
            </button>

            <motion.div
              className="flex items-center my-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <div className="flex-grow border-t border-gray-600" />
              <span className="mx-4 text-sm text-gray-400">or register with</span>
              <div className="flex-grow border-t border-gray-600" />
            </motion.div>

            <motion.div
              className="flex gap-4 pb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.3 }}
            >
              <motion.button
                type="button"
                className="w-1/2 flex items-center justify-center hover:bg-[#9674da] hover:outline-black gap-2 outline-1 outline-[#9674da] bg-transparent text-white py-2 rounded-md shadow hover:scale-105 transition-transform duration-200"
                onClick={handleGoogleSignIn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                aria-label="Sign up with Google"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google logo"
                  className="w-5 h-5"
                />
                Google
              </motion.button>

              <motion.button
                type="button"
                className="w-1/2 flex items-center justify-center gap-2 hover:bg-[#9674da] hover:outline-black outline-1 outline-[#9674da] bg-transparent text-white py-2 rounded-md shadow hover:scale-105 transition-transform duration-200"
                onClick={handleAppleSignIn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                aria-label="Sign up with Apple"
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

          {showPopup && popupType === 'apple' && (
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
                className="bg-[#2c2638] p-10 rounded-lg max-w-sm w-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4 text-center">
                  Apple Sign-In Not Available
                </h3>
                <p className="text-white text-sm mb-6 text-center">
                  We are still working on setting up Apple sign in. For now, just use Google or create an account using email.
                </p>
                <motion.button
                  type="button"
                  className="w-full bg-[#9674da] text-white py-2 rounded-md font-bold"
                  onClick={closePopup}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  aria-label="Close Apple sign-in popup"
                >
                  Exit
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default SignUpPageView;