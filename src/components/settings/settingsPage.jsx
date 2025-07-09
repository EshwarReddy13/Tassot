import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { auth, storage } from '../../firebase.js';
import { signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  HiSun, 
  HiMoon, 
  HiUser, 
  HiCog, 
  HiLogout, 
  HiCamera, 
  HiCheck,
  HiX,
  HiExclamationCircle,
  HiInformationCircle
} from 'react-icons/hi';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { userData, updateUser, loading: contextLoading, updateUserError } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ firstName: '', lastName: '' });
  const [errors, setErrors] = useState({ firstName: '', lastName: '', general: '', pfp: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeSection, setActiveSection] = useState('profile');

  // State for profile picture upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // State for logout confirmation
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

  const sections = [
    { id: 'profile', label: 'Profile', icon: HiUser },
    { id: 'preferences', label: 'Preferences', icon: HiCog },
    { id: 'account', label: 'Account', icon: HiLogout },
  ];

  if (contextLoading && !userData && !isSubmitting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl text-text-primary">Loading your settings...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-text-primary mb-2">Settings</h1>
          <div className="w-24 h-0.5 bg-accent-primary rounded-full mb-4 ml-8 mt-2"></div>
          <p className="text-text-secondary">Manage your account preferences and settings</p>
        </motion.div>

        {/* Global Messages */}
        <AnimatePresence>
          {(updateUserError || errors.general) && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3"
            >
              <HiExclamationCircle className="w-5 h-5 text-error flex-shrink-0" />
              <p className="text-error font-medium">{updateUserError || errors.general}</p>
            </motion.div>
          )}
          
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 flex items-center gap-3"
            >
              <HiCheck className="w-5 h-5 text-success flex-shrink-0" />
              <p className="text-success font-medium">{successMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {!userData && !contextLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <HiInformationCircle className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <p className="text-xl text-text-secondary">Please log in to access your settings.</p>
          </motion.div>
        )}

        {userData && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Navigation</h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeSection === section.id
                          ? 'bg-accent-primary text-white shadow-lg'
                          : 'glass-dark text-text-primary hover:text-text-primary hover:bg-bg-tertiary'
                      }`}
                    >
                      <section.icon className="w-5 h-5" />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="space-y-6">
                {/* Profile Section */}
                {activeSection === 'profile' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    {/* Profile Picture Card */}
                    <div className="glass-card p-8">
                      <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                        <HiCamera className="w-6 h-6 text-accent-primary" />
                        Profile Picture
                      </h2>
                      
                      <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                          <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-accent-primary/20 group-hover:ring-accent-primary/40 transition-all duration-300">
                            <img 
                              src={imagePreview || `https://api.dicebear.com/7.x/initials/svg?seed=${form.firstName} ${form.lastName}`} 
                              alt="Profile preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          >
                            <HiCamera className="w-8 h-8 text-white" />
                          </button>
                        </div>
                        
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-xl font-semibold text-text-primary mb-2">
                            {form.firstName} {form.lastName}
                          </h3>
                          <p className="text-text-secondary mb-6">
                            Upload a new profile picture. Max size: 2MB
                          </p>
                          
                          <input 
                            type="file" 
                            accept="image/png, image/jpeg, image/webp" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                          />
                          
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button 
                              onClick={() => fileInputRef.current?.click()}
                              className="px-6 py-3 bg-bg-dark text-text-primary rounded-xl hover:bg-bg-tertiary transition-colors duration-200 font-medium"
                              disabled={isUploading}
                            >
                              Choose New Picture
                            </button>
                            
                            {imageFile && (
                              <button 
                                onClick={handleImageUpload}
                                className="px-6 py-3 bg-accent-primary text-white rounded-xl hover:bg-accent-hover transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isUploading}
                              >
                                {isUploading ? (
                                  <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Uploading...
                                  </span>
                                ) : (
                                  'Save Picture'
                                )}
                              </button>
                            )}
                          </div>
                          
                          {errors.pfp && (
                            <motion.p 
                              initial={{ opacity: 0, x: -10 }} 
                              animate={{ opacity: 1, x: 0 }}
                              className="mt-3 text-error text-sm font-medium"
                            >
                              {errors.pfp}
                            </motion.p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Profile Details Card */}
                    <div className="glass-card p-8">
                      <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                        <HiUser className="w-6 h-6 text-accent-primary" />
                        Personal Information
                      </h2>
                      
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="firstName" className="block text-sm font-semibold text-text-primary mb-2">
                              First Name
                            </label>
                            <input 
                              id="firstName" 
                              name="firstName" 
                              type="text" 
                              value={form.firstName} 
                              onChange={handleChange}
                              className="glass-input w-full px-4 py-3 rounded-xl text-text-primary placeholder-text-tertiary"
                              placeholder="Enter your first name"
                              required 
                              disabled={contextLoading || isSubmitting}
                            />
                            {errors.firstName && (
                              <motion.p 
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0 }}
                                className="mt-2 text-error text-sm font-medium"
                              >
                                {errors.firstName}
                              </motion.p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="lastName" className="block text-sm font-semibold text-text-primary mb-2">
                              Last Name
                            </label>
                            <input 
                              id="lastName" 
                              name="lastName" 
                              type="text" 
                              value={form.lastName} 
                              onChange={handleChange}
                              className="glass-input w-full px-4 py-3 rounded-xl text-text-primary placeholder-text-tertiary"
                              placeholder="Enter your last name"
                              required 
                              disabled={contextLoading || isSubmitting}
                            />
                            {errors.lastName && (
                              <motion.p 
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0 }}
                                className="mt-2 text-error text-sm font-medium"
                              >
                                {errors.lastName}
                              </motion.p>
                            )}
                          </div>
                        </div>
                        
                        <div className="pt-4">
                          <button 
                            type="submit" 
                            className="w-full md:w-auto px-8 py-3 bg-accent-primary text-white rounded-xl hover:bg-accent-hover transition-colors duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || contextLoading}
                          >
                            {isSubmitting ? (
                              <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving Changes...
                              </span>
                            ) : (
                              'Save Changes'
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}

                {/* Preferences Section */}
                {activeSection === 'preferences' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="glass-card p-8">
                      <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                        <HiCog className="w-6 h-6 text-accent-primary" />
                        Appearance & Preferences
                      </h2>
                      
                      {/* Theme Settings */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 glass-dark rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-accent-primary/10 rounded-xl">
                              {isDarkMode ? (
                                <HiMoon className="w-6 h-6 text-accent-primary" />
                              ) : (
                                <HiSun className="w-6 h-6 text-accent-primary" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-text-primary">
                                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                              </h3>
                              <p className="text-text-secondary">
                                {isDarkMode ? 'Perfect for low-light environments' : 'Clean and bright interface'}
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={toggleTheme}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-card ${
                              isDarkMode ? 'bg-accent-primary' : 'bg-border-secondary'
                            }`}
                            role="switch"
                            aria-checked={isDarkMode}
                          >
                            <span
                              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg ${
                                isDarkMode ? 'translate-x-7' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Theme Preview */}
                        <div className="p-6 glass-dark rounded-xl">
                          <h4 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
                            Theme Preview
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full bg-accent-primary"></div>
                              <span className="text-text-primary">Primary accent color</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full bg-success"></div>
                              <span className="text-success">Success messages</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full bg-error"></div>
                              <span className="text-error">Error messages</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full bg-text-tertiary"></div>
                              <span className="text-text-tertiary">Secondary text</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Account Section */}
                {activeSection === 'account' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="glass-card p-8">
                      <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                        <HiLogout className="w-6 h-6 text-error" />
                        Account Management
                      </h2>
                      
                      <div className="space-y-6">
                        {/* Account Info */}
                        <div className="p-6 glass-dark rounded-xl">
                          <h3 className="text-lg font-semibold text-text-primary mb-4">Account Information</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Email:</span>
                              <span className="text-text-primary font-medium">{userData.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Account Type:</span>
                              <span className="text-text-primary font-medium">Standard User</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Provider:</span>
                              <span className="text-text-primary font-medium capitalize">{userData.provider}</span>
                            </div>
                          </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="p-6 bg-error/5 rounded-xl border border-error/20">
                          <h3 className="text-lg font-semibold text-error mb-4">Danger Zone</h3>
                          <p className="text-text-secondary mb-6">
                            Once you log out, you'll need to sign in again to access your account.
                          </p>
                          
                          <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="px-6 py-3 bg-error text-white rounded-xl hover:bg-red-700 transition-colors duration-200 font-semibold"
                            disabled={isSubmitting || contextLoading}
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Logout Confirmation Modal */}
        <AnimatePresence>
          {showLogoutConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={() => setShowLogoutConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-modal rounded-2xl p-8 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiLogout className="w-8 h-8 text-error" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">Sign Out</h3>
                  <p className="text-text-secondary mb-8">
                    Are you sure you want to sign out of your account?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="flex-1 px-4 py-3 bg-bg-dark text-text-primary rounded-xl hover:bg-bg-tertiary transition-colors duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex-1 px-4 py-3 bg-error text-white rounded-xl hover:bg-red-700 transition-colors duration-200 font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SettingsPage;