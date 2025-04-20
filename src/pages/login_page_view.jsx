import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

import login_background from '../assets/login_background.webp';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const navigate = useNavigate();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (value) => {
    setEmail(value);
    if (!value) {
      setEmailError('');
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
      setPasswordError('');
    } else {
      setPasswordError('');
    }
  };

  const getPasswordStrength = () => {
    const score = Object.values(passwordChecks).filter(Boolean).length;
    if (score === 0) return { width: '0%', color: 'transparent' };
    if (score <= 2) return { width: '33%', color: 'red' };
    if (score <= 4) return { width: '66%', color: 'orange' };
    return { width: '100%', color: 'green' };
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email) {
      setEmailError('Please fill in this field');
    } else if (!isValidEmail(email)) {
      setEmailError('Incorrect email format');
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Please fill in this field');
      return;
    }

    const { length, uppercase, lowercase, number, specialChar } = passwordChecks;
    if (!(length && uppercase && lowercase && number && specialChar)) {
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen flex font-poppins">
      {/* Left Image Section */}
      <div className="w-1/2 h-screen bg-[#2c2638] p-4 flex items-center justify-center">
        <img
          src={login_background}
          alt="Login Background"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      {/* Right Form Section */}
      <div className="w-1/2 h-screen flex flex-col justify-center px-12 bg-[#2c2638]">
        <h2 className="text-5xl font-bold text-white mb-6 text-center">Log In</h2>

        <p className="mt-3 mb-8 text-center text-sm text-white">
          Don't have an account?{' '}
          <Link to="/signup" className="underline font-bold text-[#9500ff]">
            Sign Up
          </Link>
        </p>

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
              <p className="text-red-400 text-sm mt-1">{emailError}</p>
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
              <p className="text-red-400 text-sm mt-1">{passwordError}</p>
            )}

            {password && (
              <>
                {/* Strength Bar */}
                <div className="w-full h-2 mt-5 bg-[#4a4952] rounded-md">
                  <div
                    style={{
                      width: passwordStrength.width,
                      backgroundColor: passwordStrength.color,
                    }}
                    className="h-2 rounded-md transition-all duration-300"
                  />
                </div>

                {/* Inline checklist */}
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-white">
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
                </div>
              </>
            )}
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-center space-x-2 mt-2">
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
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#9674da] text-white p-2 rounded-md hover:opacity-90 hover:bg-[#9500ff] transition-opacity font-bold"
          >
            Log In
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-600" />
            <span className="mx-4 text-sm text-gray-400">or register with</span>
            <div className="flex-grow border-t border-gray-600" />
          </div>

          {/* OAuth Buttons Row */}
          <div className="flex gap-4">
            {/* Google */}
            <button
              type="button"
              className="w-1/2 flex items-center justify-center hover:bg-[#9674da] hover:outline-black gap-2 outline-1 outline-[#9674da] bg-transparent text-white py-2 rounded-md shadow hover:shadow-md transition"
              onClick={() => console.log('Google Sign-In logic goes here')}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Google
            </button>

            {/* Apple */}
            <button
              type="button"
              className="w-1/2 flex items-center justify-center gap-2 hover:bg-[#9674da] hover:outline-black outline-1 outline-[#9674da] bg-transparent text-white py-2 rounded-md shadow hover:shadow-md transition"
              onClick={() => console.log('Apple Sign-In logic goes here')}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg"
                alt="Apple"
                className="w-5 h-5"
              />
              Apple
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
