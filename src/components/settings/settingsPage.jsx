// src/pages/SettingsPage.jsx
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext.jsx'; // Adjust path
import { auth } from '../../firebase.js'; // Adjust path
import { signOut } from 'firebase/auth';

const SettingsPage = () => {
  const navigate = useNavigate();
  const {
    userData,
    updateUser,
    loading: contextLoading,
    updateUserError,
  } = useUser();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    general: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (userData) {
      setForm({
        firstName: userData.firstName || '',
        lastName:  userData.lastName  || '',
      });
    }
  }, [userData]);

  const validateField = (name, value) => {
    if (!value.trim()) {
      return `${name === 'firstName' ? 'First' : 'Last'} name is required`;
    }
    if (value.length > 50) {
      return `${name === 'firstName' ? 'First' : 'Last'} name must be 50 characters or less`;
    }
    if (!/^[A-Za-z\s-]+$/.test(value)) {
      return `${name === 'firstName' ? 'First' : 'Last'} name can only contain letters, spaces, or hyphens`;
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
      general: '',
    }));
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    // Validate fields
    const firstNameError = validateField('firstName', form.firstName);
    const lastNameError  = validateField('lastName',  form.lastName);
    setErrors({ firstName: firstNameError, lastName: lastNameError, general: '' });
    if (firstNameError || lastNameError) {
      setIsSubmitting(false);
      return;
    }

    try {
      await updateUser({
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
      });
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Update failed on SettingsPage:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      setErrors((prev) => ({ ...prev, general: err.message || 'Failed to log out' }));
    }
  };

  if (contextLoading && !userData && !isSubmitting) {
    return (
      <div className="min-h-screen bg-[#292830] flex items-center justify-center">
        <p className="text-white text-xl">Loading user settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#292830]">
      <main className="ml-[4rem] mr-4 pt-6 pb-4 px-6 min-h-[calc(100vh)]" aria-label="Settings">
        <motion.h1
          className="text-3xl font-bold text-white mb-6"
          style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Settings
        </motion.h1>

        {updateUserError && (
          <motion.p className="text-red-400 text-sm mb-4 text-center" role="alert"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            {updateUserError}
          </motion.p>
        )}

        {errors.general && (
          <motion.p className="text-red-400 text-sm mb-4 text-center" role="alert"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            {errors.general}
          </motion.p>
        )}

        {successMessage && (
          <motion.p className="text-green-400 text-sm mb-4 text-center" role="status"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            {successMessage}
          </motion.p>
        )}

        {!userData && !contextLoading && (
          <motion.p className="text-gray-400 text-lg text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            Please log in to update your settings.
          </motion.p>
        )}

        {userData && (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <label htmlFor="firstName" className="block text-white text-lg font-medium mb-1">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                className="w-full bg-[#17171b] text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#9674da]"
                placeholder="Enter first name"
                aria-required="true"
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                disabled={contextLoading || isSubmitting}
              />
              {errors.firstName && (
                <motion.p id="firstName-error" className="text-red-400 text-sm mt-1" role="alert"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  {errors.firstName}
                </motion.p>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <label htmlFor="lastName" className="block text-white text-lg font-medium mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                className="w-full bg-[#17171b] text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#9674da]"
                placeholder="Enter last name"
                aria-required="true"
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                disabled={contextLoading || isSubmitting}
              />
              {errors.lastName && (
                <motion.p id="lastName-error" className="text-red-400 text-sm mt-1" role="alert"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  {errors.lastName}
                </motion.p>
              )}
            </motion.div>

            <motion.div className="flex gap-4 justify-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <button
                type="submit"
                className="bg-[#9674da] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#7e5cb7] disabled:bg-gray-600 disabled:cursor-not-allowed"
                disabled={isSubmitting || contextLoading}
                aria-label="Save profile changes"
              >
                {isSubmitting || contextLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                disabled={isSubmitting || contextLoading}
                aria-label="Log out"
              >
                Log Out
              </button>
            </motion.div>
          </form>
        )}
      </main>
    </div>
  );
};

export default SettingsPage;
