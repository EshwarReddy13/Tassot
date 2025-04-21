import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { motion } from 'framer-motion';

import login_background from '../assets/login_background.webp';

function SignUpPageView() {
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

  const navigate = useNavigate();

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
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`,
      });
      navigate('/dashboard');
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthError('');
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (!user.displayName) {
        await updateProfile(user, {
          displayName: 'User',
        });
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setAuthError(err.message || 'Failed to sign in with Google');
    }
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen flex font-poppins w-full h-screen overflow-hidden">
      {/* Left Image Section */}
      <div className="w-1/2 h-full bg-[#2c2638] p-4 flex items-center justify-center transition-none min-w-0 flex-shrink-0">
        <img
          src={login_background}
          alt="Signup Background"
          className="w-full h-full object-cover rounded-lg scale-100 transition-none"
        />
      </div>

      {/* Right Form Section */}
      <motion.div
        className="w-1/2 h-full flex flex-col px-12 bg-[#2c2638] min-w-0 flex-shrink-0 overflow-y-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="w-full max-w-md mx-auto pt-6">
          <motion.h2
            className="text-5xl font-bold text-white mb-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Sign Up
          </motion.h2>

          <motion.p
            className="mt-3 mb-8 text-center text-sm text-white"
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
              {/* First Name */}
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
                />
                {firstNameError && (
                  <motion.p
                    className="text-red-400 text-sm mt-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    {firstNameError}
                  </motion.p>
                )}
              </div>

              {/* Last Name */}
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
                />
                {lastNameError && (
                  <motion.p
                    className="text-red-400 text-sm mt-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    {lastNameError}
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* Email */}
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
              />
              {emailError && (
                <motion.p
                  className="text-red-400 text-sm mt-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {emailError}
                </motion.p>
              )}
            </div>

            {/* Password */}
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
              />
              {passwordError && (
                <motion.p
                  className="text-red-400 text-sm mt-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {passwordError}
                </motion.p>
              )}

              {password && (
                <>
                  {/* Strength Bar */}
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

                  {/* Inline checklist */}
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

            {/* Confirm Password */}
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
              />
              {confirmPasswordError && (
                <motion.p
                  className="text-red-400 text-sm mt-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {confirmPasswordError}
                </motion.p>
              )}
            </div>

            {/* Terms & Conditions */}
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

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-[#9674da] text-white p-2 rounded-md font-bold"
            >
              Sign Up
            </button>

            {/* Divider */}
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

            {/* OAuth Buttons Row */}
            <motion.div
              className="flex gap-4 pb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.3 }}
            >
              {/* Google */}
              <motion.button
                type="button"
                className="w-1/2 flex items-center justify-center hover:bg-[#9674da] hover:outline-black gap-2 outline-1 outline-[#9674da] bg-transparent text-white py-2 rounded-md shadow hover:scale-105 transition-transform duration-200"
                onClick={handleGoogleSignIn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Google
              </motion.button>

              {/* Apple */}
              <motion.button
                type="button"
                className="w-1/2 flex items-center justify-center gap-2 hover:bg-[#9674da] hover:outline-black outline-1 outline-[#9674da] bg-transparent text-white py-2 rounded-md shadow hover:scale-105 transition-transform duration-200"
                onClick={() => console.log('Apple Sign-Up logic goes here')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg"
                  alt="Apple"
                  className="w-5 h-5"
                />
                Apple
              </motion.button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default SignUpPageView;