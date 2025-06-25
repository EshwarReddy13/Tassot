import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { auth, storage } from '../../firebase.js';
import { signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { HiSun, HiMoon } from 'react-icons/hi';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { userData, updateUser, loading: contextLoading, updateUserError } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ firstName: '', lastName: '' });
  const [errors, setErrors] = useState({ firstName: '', lastName: '', general: '', pfp: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // State for profile picture upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (userData) {
      setForm({
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
      });
      setImagePreview(userData.photo_url || '');
    }
  }, [userData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setErrors(prev => ({ ...prev, pfp: 'File is too large. Max size is 2MB.' }));
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrors(prev => ({ ...prev, pfp: 'Invalid file type. Please use JPG, PNG, or WEBP.' }));
        return;
      }
      setErrors(prev => ({ ...prev, pfp: '' }));
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;
    setIsUploading(true);
    setErrors(prev => ({ ...prev, pfp: '' }));
    setSuccessMessage('');

    try {
      const storageRef = ref(storage, `profile_pics/${userData.firebase_uid}`);
      await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(storageRef);
      await updateUser({ photoURL: downloadURL });
      setSuccessMessage('Profile picture updated successfully!');
      setImageFile(null);
    } catch (err) {
      console.error('PFP Upload Failed:', err);
      setErrors(prev => ({ ...prev, pfp: 'Upload failed. Please try again.' }));
    } finally {
      setIsUploading(false);
    }
  };

  const validateField = (name, value) => {
    if (!value.trim()) return `${name === 'firstName' ? 'First' : 'Last'} name is required`;
    if (value.length > 50) return `${name === 'firstName' ? 'First' : 'Last'} name must be 50 characters or less`;
    if (!/^[A-Za-z\s-]+$/.test(value)) return `${name === 'firstName' ? 'First' : 'Last'} name can only contain letters, spaces, or hyphens`;
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value), general: '' }));
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    const firstNameError = validateField('firstName', form.firstName);
    const lastNameError = validateField('lastName', form.lastName);
    setErrors(prev => ({ ...prev, firstName: firstNameError, lastName: lastNameError, general: '' }));
    if (firstNameError || lastNameError) {
      setIsSubmitting(false);
      return;
    }
    try {
      await updateUser({ firstName: form.firstName.trim(), lastName: form.lastName.trim() });
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Update failed:', err);
      setErrors(prev => ({...prev, general: err.message || "Failed to update profile."}));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      setErrors(prev => ({ ...prev, general: err.message || 'Failed to log out' }));
    }
  };

  if (contextLoading && !userData && !isSubmitting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <p className="text-xl text-text-primary">Loading user settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="min-h-screen px-6 pt-6 pb-4 ml-16" aria-label="Settings">
        <motion.h1
          className="mb-6 font-bold text-text-primary"
          style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          Settings
        </motion.h1>

        {updateUserError && <motion.p className="mb-4 text-sm text-center text-error" role="alert" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>{updateUserError}</motion.p>}
        {errors.general && <motion.p className="mb-4 text-sm text-center text-error" role="alert" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>{errors.general}</motion.p>}
        {successMessage && <motion.p className="mb-4 text-sm text-center text-success" role="status" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>{successMessage}</motion.p>}
        {!userData && !contextLoading && <motion.p className="text-lg text-center text-text-secondary" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Please log in to update your settings.</motion.p>}

        {userData && (
          <div className="max-w-xl mx-auto space-y-8">
            {/* --- Theme Settings Section --- */}
            <motion.div className="p-4 rounded-lg bg-bg-secondary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="mb-4 text-xl font-semibold text-text-primary">Theme Settings</h2>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {isDarkMode ? (
                    <HiMoon className="w-6 h-6 text-accent-primary" />
                  ) : (
                    <HiSun className="w-6 h-6 text-accent-primary" />
                  )}
                  <div>
                    <p className="text-text-primary font-medium">
                      {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </p>
                    <p className="text-text-secondary text-sm">
                      {isDarkMode ? 'Dark theme for better visibility in low light' : 'Light theme for better readability'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 ${
                    isDarkMode ? 'bg-accent-primary' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={isDarkMode}
                  aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Theme Preview */}
              <div className="p-3 rounded-lg bg-bg-card border border-bg-dark">
                <p className="text-text-secondary text-sm mb-2">Preview:</p>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-accent-primary"></div>
                  <span className="text-text-primary text-sm">Sample text with current theme</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-success text-sm">Success message</span>
                </div>
              </div>
            </motion.div>

            {/* --- Profile Picture Section --- */}
            <motion.div className="p-4 rounded-lg bg-bg-secondary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="mb-4 text-xl font-semibold text-text-primary">Profile Picture</h2>
              <div className="flex items-center gap-6">
                <img src={imagePreview || `https://api.dicebear.com/7.x/initials/svg?seed=${form.firstName} ${form.lastName}`} alt="Profile preview" className="object-cover w-24 h-24 rounded-full bg-bg-card ring-2 ring-accent-primary" />
                <div className="flex-grow">
                  <input type="file" accept="image/png, image/jpeg, image/webp" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <div className="flex gap-4">
                    <button type="button" onClick={() => fileInputRef.current.click()} className="px-4 py-2 font-semibold transition-colors duration-200 border rounded-lg border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-text-primary disabled:opacity-50" disabled={isUploading}>
                      Choose Image
                    </button>
                    {imageFile && (
                      <button type="button" onClick={handleImageUpload} className="px-4 py-2 font-semibold text-white transition-colors duration-200 rounded-lg bg-accent-primary hover:bg-accent-hover disabled:bg-gray-600 disabled:cursor-not-allowed" disabled={isUploading}>
                        {isUploading ? 'Uploading...' : 'Save Picture'}
                      </button>
                    )}
                  </div>
                  {errors.pfp && <motion.p className="mt-2 text-sm text-error" role="alert" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>{errors.pfp}</motion.p>}
                </div>
              </div>
            </motion.div>

            {/* --- Profile Details Section --- */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4 rounded-lg bg-bg-secondary">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <label htmlFor="firstName" className="block mb-1 text-lg font-medium text-text-primary">First Name</label>
                <input id="firstName" name="firstName" type="text" value={form.firstName} onChange={handleChange} className="w-full p-2 text-white rounded-lg bg-bg-card focus:outline-none focus:ring-2 focus:ring-accent-primary" placeholder="Enter first name" required aria-describedby={errors.firstName ? 'firstName-error' : undefined} disabled={contextLoading || isSubmitting} />
                {errors.firstName && <motion.p id="firstName-error" className="mt-1 text-sm text-error" role="alert" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>{errors.firstName}</motion.p>}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <label htmlFor="lastName" className="block mb-1 text-lg font-medium text-text-primary">Last Name</label>
                <input id="lastName" name="lastName" type="text" value={form.lastName} onChange={handleChange} className="w-full p-2 text-white rounded-lg bg-bg-card focus:outline-none focus:ring-2 focus:ring-accent-primary" placeholder="Enter last name" required aria-describedby={errors.lastName ? 'lastName-error' : undefined} disabled={contextLoading || isSubmitting} />
                {errors.lastName && <motion.p id="lastName-error" className="mt-1 text-sm text-error" role="alert" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>{errors.lastName}</motion.p>}
              </motion.div>
              
              <motion.div className="pt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <button type="submit" className="w-full px-4 py-2 font-semibold text-white transition-colors duration-200 rounded-lg bg-accent-primary hover:bg-accent-hover disabled:bg-gray-600 disabled:cursor-not-allowed" disabled={isSubmitting || contextLoading}>
                  {isSubmitting ? 'Saving...' : 'Save Profile Details'}
                </button>
              </motion.div>
            </form>
            
            {/* --- Logout Section --- */}
            <motion.div className="p-4 text-center rounded-lg bg-bg-secondary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <button type="button" onClick={handleLogout} className="px-6 py-2 font-semibold text-white transition-colors duration-200 bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50" disabled={isSubmitting || contextLoading}>
                Log Out
              </button>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SettingsPage;