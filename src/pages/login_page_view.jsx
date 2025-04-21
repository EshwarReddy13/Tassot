import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { motion } from 'framer-motion';

import login_background from '../assets/login_background.webp';

function SignInPageView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');

  const navigate = useNavigate();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
    if (!val) {
      setPasswordError('Please fill in this field');
    } else {
      setPasswordError('');
    }
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
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Please fill in this field');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) return;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthError('');
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setAuthError(err.message || 'Failed to sign in with Google');
    }
  };

  return (
    <div className="min-h-screen flex font-poppins w-full h-screen overflow-hidden">
      {/* Left Image Section */}
      <div className="w-1/2 h-full bg-[#2c2638] p-4 flex items-center justify-center transition-none min-w-0 flex-shrink-0">
        <img
          src={login_background}
          alt="Login Background"
          className="w-full h-full object-cover rounded-lg scale-100 transition-none"
        />
      </div>

      {/* Right Form Section */}
      <motion.div
        className="w-1/2 h-full flex flex-col justify-center px-12 bg-[#2c2638] min-w-0 flex-shrink-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.h2
          className="text-5xl font-bold text-white mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Log In
        </motion.h2>

        <motion.p
          className="mt-3 mb-8 text-center text-sm text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Don't have an account?{' '}
          <Link to="/signup" className="underline font-bold text-[#9500ff]">
            Sign Up
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

        <form onSubmit={handleLogin} className="space-y-4 w-full max-w-md mx-auto">
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
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#9674da] text-white p-2 rounded-md font-bold"
          >
            Log In
          </button>

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
              onClick={() => console.log('Apple Sign-In logic goes here')}
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
      </motion.div>
    </div>
  );
}

export default SignInPageView;