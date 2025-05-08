import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../../global widgets/documentProvider.jsx'; // Adjust path as needed
import { useUser } from '../../global widgets/userProvider.jsx'; // Adjust path as needed

const generateProjectId = (projectName) => {
  const randomChars = Math.random().toString(36).substring(2, 12);
  return `${projectName.toLowerCase().replace(/\s+/g, '-')}-${randomChars}`;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const CreateProjectDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { createProject, error: documentError, loading } = useDocuments();
  const { userData } = useUser();
  const [step, setStep] = useState('create');
  const [projectName, setProjectName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [popup, setPopup] = useState({ show: false, message: '' });
  const projectId = projectName ? generateProjectId(projectName) : '';

  const handleNext = () => {
    if (projectName) {
      setStep('invite');
    }
  };

  const handleAddEmail = () => {
    if (!email) {
      setEmailError('Please fill in this field');
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError('Incorrect email format');
      return;
    }
    setEmailError('');
    setPopup({ show: true, message: `Email sent to ${email} successfully` });
    setEmail('');
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

  const handleCreate = async () => {
    if (!userData?.uid) {
      setPopup({ show: true, message: 'You must be logged in to create a project' });
      return;
    }

    try {
      await createProject(projectId, projectName, userData.uid);
      setPopup({ show: true, message: 'Project created successfully!' });
      setTimeout(() => {
        handleClose();
        navigate(`/projects/${projectId}`); // Fixed to match App.jsx route
      }, 2000);
    } catch (err) {
      setPopup({ show: true, message: documentError || 'Failed to create project' });
    }
  };

  const handleClose = () => {
    setProjectName('');
    setEmail('');
    setEmailError('');
    setPopup({ show: false, message: '' });
    setStep('create');
    onClose();
  };

  useEffect(() => {
    if (popup.show) {
      const timer = setTimeout(() => {
        setPopup({ show: false, message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [popup.show]);

  const fieldVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  const popupVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none font-poppins"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="flex h-full bg-[#292830] ml-[5rem] pointer-events-auto">
            <div className="w-1/2 flex flex-col pt-6 pl-6 pr-4 relative">
              <button
                className="text-white text-2xl mb-5 self-start"
                onClick={handleClose}
                aria-label="Close drawer"
              >
                ✕
              </button>

              <AnimatePresence mode="wait">
                {step === 'create' ? (
                  <motion.div
                    key="create-step"
                    variants={fieldVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <h2 className="text-white text-4xl font-bold mb-2 mt-5 text-left">
                      Create Your Project
                    </h2>
                    <p className="text-gray-400 text-xl mb-25 text-left">
                      Start your collaborative journey by setting up a new project.
                    </p>

                    <div className="mb-4">
                      <label
                        htmlFor="project-name"
                        className="block text-white text-xl font-medium mb-2 text-left"
                      >
                        Enter your new Project Name
                      </label>
                      <input
                        id="project-name"
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-100 h-13 bg-[#161616] text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#9674da]"
                        placeholder="Enter project name"
                        aria-required="true"
                      />
                    </div>

                    <div className="mb-6">
                      <label
                        htmlFor="project-id"
                        className="block text-white text-lg font-medium mb-1 text-left"
                      >
                        Project ID
                      </label>
                      <div
                        id="project-id"
                        className="inline-block text-lg bg-[#161616] text-gray-400 rounded-full px-4 py-2 cursor-not-allowed"
                        aria-readonly="true"
                      >
                        {projectId || 'Generated after entering project name'}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="text-gray-400 text-lg text-left">
                        Already have a project?{' '}
                        <button
                          className="text-[#9674da] hover:underline"
                          onClick={() => navigate('/join-project')}
                          aria-label="Join an existing project"
                        >
                          <u>Join a project</u>
                        </button>
                      </p>
                      <div className="ml-15"></div>
                      <motion.button
                        className="w-30 bg-[#9674da] text-white text-lg py-2 px-4 rounded-lg font-semibold hover:bg-[#7e5cb7] disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
                        onClick={handleNext}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!projectName}
                        aria-label="Proceed to invite users"
                      >
                        Next
                        <img
                          src="https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/arrow_circle_left/materialsymbolsoutlined/arrow_circle_left_24px.svg"
                          alt="Arrow icon for next step"
                          className="w-8 h-8 invert scale-x-[-1]"
                          style={{ filter: 'invert(100%)' }}
                          onError={(e) => {
                            console.error('Failed to load arrow icon');
                            e.target.src = 'https://api.iconify.design/mdi:alert-circle.svg';
                            e.target.style.filter = 'invert(100%)';
                          }}
                        />
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="invite-step"
                    variants={fieldVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <h2 className="text-white text-4xl font-bold mb-2 mt-5 text-left">
                      Invite Users
                    </h2>
                    <p className="text-gray-400 text-xl mb-25 text-left">
                      Invite team members to collaborate on your project
                    </p>

                    <div className="mb-10 flex items-center gap-2">
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-white text-xl font-medium mb-2 text-left"
                        >
                          Enter Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          className="w-130 h-13 bg-[#161616] text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#9674da]"
                          placeholder="Enter an email address"
                          aria-required="false"
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
                      <motion.button
                        className="mt-8 bg-[#9674da] h-13 text-lg text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#7e5cb7] disabled:bg-gray-600 disabled:cursor-not-allowed"
                        onClick={handleAddEmail}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!email}
                        aria-label="Add email to invite list"
                      >
                        + Add
                      </motion.button>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="text-gray-400 text-lg">
                        You can always add users later on
                      </p>
                      <motion.button
                        className="w-32 bg-[#9674da] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#7e5cb7] flex items-center gap-2"
                        onClick={handleCreate}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading}
                        aria-label="Create project and send invitations"
                      >
                        {loading ? 'Creating...' : 'Create'}
                        <img
                          src="https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/arrow_circle_left/materialsymbolsoutlined/arrow_circle_left_24px.svg"
                          alt="Arrow icon for create step"
                          className="w-8 h-8 invert scale-x-[-1]"
                          style={{ filter: 'invert(100%)' }}
                          onError={(e) => {
                            console.error('Failed to load arrow icon');
                            e.target.src = 'https://api.iconify.design/mdi:alert-circle.svg';
                            e.target.style.filter = 'invert(100%)';
                          }}
                        />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {popup.show && (
                  <motion.div
                    className={`absolute bottom-4 left-6 px-4 py-2 rounded-lg shadow-lg ${
                      popup.message.includes('Failed') ? 'bg-red-600' : 'bg-green-600'
                    } text-white`}
                    variants={popupVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    aria-live="polite"
                  >
                    {popup.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-1/2">
              <div
                className="h-full bg-gray-700 flex items-center justify-center"
                role="img"
                aria-label="Placeholder image for project creation"
              >
                <span className="text-gray-400 text-lg">Image Placeholder</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateProjectDrawer;