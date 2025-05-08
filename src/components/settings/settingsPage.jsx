import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/userContext.jsx'; // Adjust path
import { auth } from '../../firebase.js'; // Adjust path
import { signOut } from 'firebase/auth';

const SettingsPage = () => {
  const navigate = useNavigate();
  // Destructure loading and updateUserError from the context
  const {
    userData,
    updateUser,
    loading: contextLoading, // Renamed to avoid conflict if local loading states were used
    updateUserError, // Specific error from updateUser calls in context
    // firebaseUser, // Can be used for more direct auth checks if needed
  } = useUser();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    general: '', // For page-specific errors like logout
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (userData) {
      // Populate form with data from context, using correct field names
      setForm({
        firstName: userData.first_name || '', // Changed from userData.firstName
        lastName: userData.last_name || '',  // Changed from userData.lastName
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
      general: '', // Clear general error on field change
    }));
    setSuccessMessage('');
    // updateUserError from context will be cleared by the context itself on next attempt
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    // Clear general page errors, field errors are set below
    setErrors(prev => ({ firstName: prev.firstName, lastName: prev.lastName, general: '' }));
    // Note: updateUserError from context is cleared within the updateUser function itself.

    const firstNameError = validateField('firstName', form.firstName);
    const lastNameError = validateField('lastName', form.lastName);
    setErrors({ firstName: firstNameError, lastName: lastNameError, general: '' });

    if (firstNameError || lastNameError) {
      setIsSubmitting(false);
      return;
    }

    // The updateUser function from context now handles auth checks (firebaseUser presence)
    try {
      await updateUser({ // UID is no longer passed here
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      });
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      // updateUserError is already set by the context.
      // This catch block is here to stop isSubmitting and potentially log.
      console.error('Update failed on SettingsPage:', err.message);
      // No need to set errors.general for the update error itself if updateUserError is displayed.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: err.message || 'Failed to log out',
      }));
    }
  };

  const fieldVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  // Enhanced loading and user data display logic
  if (contextLoading && !userData && !isSubmitting) {
    // Show loading indicator if context is loading initial user data
    // and not already in a local submission process (isSubmitting)
    return (
      <div className="min-h-screen bg-[#292830] flex items-center justify-center">
        <p className="text-white text-xl">Loading user settings...</p>
        {/* You can replace this with a spinner component */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#292830]">
      <main
        className="ml-[4rem] mr-4 pt-6 pb-4 px-6 min-h-[calc(100vh)]"
        aria-label="Settings"
      >
        <motion.h1
          className="text-3xl font-bold text-white mb-6"
          style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Settings
        </motion.h1>

        {/* Display updateUserError from context */}
        {updateUserError && (
          <motion.p
            className="text-red-400 text-sm mb-4 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            role="alert"
          >
            {updateUserError}
          </motion.p>
        )}

        {/* Display general errors (e.g., logout error) */}
        {/* Only show if not an updateUserError to avoid redundancy, though they handle different errors now. */}
        {errors.general && (
          <motion.p
            className="text-red-400 text-sm mb-4 text-center"
            initial={{ opacity: 0, y: -10 }} // Changed x to y for variety
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            role="alert"
          >
            {errors.general}
          </motion.p>
        )}

        {successMessage && (
          <motion.p
            className="text-green-400 text-sm mb-4 text-center"
            initial={{ opacity: 0, y: -10 }} // Changed x to y
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            role="status"
          >
            {successMessage}
          </motion.p>
        )}

        {!userData && !contextLoading && ( // Show if no user data and not currently loading it
          <motion.p
            className="text-gray-400 text-lg text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Please log in to update your settings.
          </motion.p>
        )}

        {userData && ( // Only show form if userData exists
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <motion.div variants={fieldVariants} initial="initial" animate="animate">
              <label
                htmlFor="firstName"
                className="block text-white text-lg font-medium mb-1 text-left"
              >
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
                disabled={contextLoading || isSubmitting} // Disable input during context loading or local submitting
              />
              {errors.firstName && (
                <motion.p
                  id="firstName-error"
                  className="text-red-400 text-sm mt-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  role="alert"
                >
                  {errors.firstName}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={fieldVariants} initial="initial" animate="animate">
              <label
                htmlFor="lastName"
                className="block text-white text-lg font-medium mb-1 text-left"
              >
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
                disabled={contextLoading || isSubmitting} // Disable input
              />
              {errors.lastName && (
                <motion.p
                  id="lastName-error"
                  className="text-red-400 text-sm mt-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  role="alert"
                >
                  {errors.lastName}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              className="flex gap-4 justify-center"
              variants={fieldVariants}
              initial="initial"
              animate="animate"
            >
              <motion.button
                type="submit"
                className="bg-[#9674da] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#7e5cb7] disabled:bg-gray-600 disabled:cursor-not-allowed"
                disabled={isSubmitting || contextLoading} // Disable based on local submit and context loading
                whileHover={!(isSubmitting || contextLoading) ? { scale: 1.05 } : {}}
                whileTap={!(isSubmitting || contextLoading) ? { scale: 0.95 } : {}}
                aria-label="Save profile changes"
              >
                {(isSubmitting || contextLoading) ? 'Saving...' : 'Save'}
              </motion.button>
              <motion.button
                type="button"
                onClick={handleLogout}
                className="bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Log out"
                disabled={isSubmitting || contextLoading} // Also disable during general loading/submitting
              >
                Log Out
              </motion.button>
            </motion.div>
          </form>
        )}
      </main>
    </div>
  );
};

export default SettingsPage;