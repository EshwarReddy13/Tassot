import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../../global widgets/document_provider.jsx';
import { useUser } from '../../global widgets/user_provider.jsx';

const generateProjectId = (projectName) => {
  const randomChars = Math.random().toString(36).substring(2, 12);
  return `${projectName.toLowerCase().replace(/\s+/g, '-')}-${randomChars}`;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidKey = (key) => /^[A-Z0-9_-]{1,10}$/.test(key);

const CreateProjectDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { createProject, error: documentError, loading } = useDocuments();
  const { userData } = useUser();
  const [step, setStep] = useState('create');
  const [projectName, setProjectName] = useState('');
  const [key, setKey] = useState('');
  const [keyError, setKeyError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [popup, setPopup] = useState({ show: false, message: '' });
  const [showTooltip, setShowTooltip] = useState(false);
  const projectId = projectName ? generateProjectId(projectName) : '';

  const handleNext = () => {
    if (!projectName) {
      setPopup({ show: true, message: 'Project name is required' });
      return;
    }
    if (!key) {
      setKeyError('Project key is required');
      return;
    }
    if (!isValidKey(key)) {
      setKeyError('Key must be 1-10 characters, using letters, numbers, hyphens, or underscores');
      return;
    }
    setStep('invite');
  };

  const handleBack = () => {
    setStep('create');
  };

  const handleKeyChange = (value) => {
    const upperValue = value.toUpperCase();
    setKey(upperValue);
    if (!upperValue) {
      setKeyError('Project key is required');
    } else if (!isValidKey(upperValue)) {
      setKeyError('Key must be 1-10 characters, using letters, numbers, hyphens, or underscores');
    } else {
      setKeyError('');
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
      await createProject(projectId, projectName, userData.uid, key);
      setPopup({
        show: true,
        message: 'Project created with boards (To Do, In Progress, Done) and initial task "First to do"!',
      });
      setTimeout(() => {
        handleClose();
        navigate(`/projects/${projectId}`);
      }, 2000);
    } catch (err) {
      setPopup({ show: true, message: documentError || 'Failed to create project' });
    }
  };

  const handleClose = () => {
    setProjectName('');
    setKey('');
    setKeyError('');
    setEmail('');
    setEmailError('');
    setPopup({ show: false, message: '' });
    setShowTooltip(false);
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
          <div className="flex h-full bg-bg-primary ml-[6rem] pointer-events-auto">
            <div className="w-1/2 flex flex-col pt-6 pl-6 pr-4 relative">
              <div className="flex items-center mb-5">
                {step === 'invite' && (
                  <motion.button
                    className="text-text-primary text-2xl mr-2"
                    onClick={handleBack}
                    aria-label="Go back to project creation"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </motion.button>
                )}
                <button
                  className="text-text-primary text-2xl self-start"
                  onClick={handleClose}
                  aria-label="Close drawer"
                >
                  ✕
                </button>
              </div>

              <AnimatePresence mode="wait">
                {step === 'create' ? (
                  <motion.div
                    key="create-step"
                    variants={fieldVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <h2 className="text-text-primary text-4xl font-bold mb-2 mt-5 text-left">
                      Create Your Project
                    </h2>
                    <p className="text-text-secondary text-xl mb-10 text-left">
                      Start your collaborative journey by setting up a new project.
                    </p>

                    <div className="mb-4">
                      <label
                        htmlFor="project-name"
                        className="text-text-primary text-xl font-medium mb-4 text-left"
                      >
                        Enter your new Project Name
                      </label>
                      <input
                        id="project-name"
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-100 h-13 mt-2 bg-bg-dark text-text-primary rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                        placeholder="Enter project name"
                        aria-required="true"
                      />
                    </div>

                    <div className="mb-6 relative">
                      <label
                        htmlFor="project-key"
                        className="text-text-primary text-xl font-medium mb-2 text-left flex items-center"
                      >
                        Project Key
                        <span
                          className="ml-2 text-text-secondary text-sm cursor-help"
                          onMouseEnter={() => setShowTooltip(true)}
                          onMouseLeave={() => setShowTooltip(false)}
                        >
                          ⓘ
                        </span>
                      </label>
                      {showTooltip && (
                        <div className="absolute z-10 p-3 bg-bg-secondary border-3 border-accent-primary text-text-primary text-sm rounded-lg shadow-lg w-60 top-8 left-30">
                          Select a short prefix (e.g., PROJ) to identify tasks in this project.
                        </div>
                      )}
                      <input
                        id="project-key"
                        type="text"
                        value={key}
                        onChange={(e) => handleKeyChange(e.target.value)}
                        className="w-70 h-13 bg-bg-dark text-text-primary rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                        placeholder="Enter project key (e.g., PROJ)"
                        aria-required="true"
                        aria-describedby={keyError ? 'key-error' : undefined}
                      />
                      {keyError && (
                        <motion.p
                          id="key-error"
                          className="text-error text-sm mt-1"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                          role="alert"
                        >
                          {keyError}
                        </motion.p>
                      )}
                    </div>

                    <div className="mb-6">
                      <label
                        htmlFor="project-id"
                        className="text-text-primary text-lg font-medium mb-1 text-left"
                      >
                        Project ID:
                      </label>
                      <div
                        id="project-id"
                        className="inline-block ml-2 text-sm bg-bg-dark text-text-secondary rounded-full px-4 py-2 cursor-not-allowed"
                        aria-readonly="true"
                      >
                        {projectId || 'Generated after entering project name'}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <p className="text-text-secondary text-lg text-left">
                        Already have a project?{' '}
                        <button
                          className="text-accent-primary hover:underline"
                          onClick={() => navigate('/join-project')}
                          aria-label="Join an existing project"
                        >
                          <u>Join a project</u>
                        </button>
                      </p>
                      <div className="flex justify-end gap-2">
                        <motion.button
                          className="border-2 border-accent-primary mr-2 bg-bg-dark text-text-primary text-lg py-2 px-6 rounded-lg font-semibold"
                          onClick={handleClose}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label="Cancel project creation"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          className="bg-accent-primary text-text-primary text-lg py-2 px-6 rounded-lg font-semibold disabled:bg-bg-card disabled:cursor-not-allowed flex items-center gap-2"
                          onClick={handleNext}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={!projectName || !key || keyError}
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
                    <h2 className="text-text-primary text-4xl font-bold mb-2 mt-5 text-left">
                      Invite Users
                    </h2>
                    <p className="text-text-secondary text-xl mb-10 text-left">
                      Invite team members to collaborate on your project
                    </p>

                    <div className="mb-10 flex items-start gap-2">
                      <div className="flex flex-col min-h-[5rem]">
                        <label
                          htmlFor="email"
                          className="text-text-primary text-xl font-medium mb-2 text-left"
                        >
                          Enter Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          className="w-130 h-13 bg-bg-dark text-text-primary rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                          placeholder="Enter an email address"
                          aria-required="false"
                          aria-describedby={emailError ? 'email-error' : undefined}
                        />
                        {emailError && (
                          <motion.p
                            id="email-error"
                            className="text-error text-sm mt-1"
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
                        className="bg-accent-primary h-13 text-text-primary text-lg py-2 px-4 rounded-lg font-semibold disabled:bg-bg-card disabled:cursor-not-allowed mt-9"
                        onClick={handleAddEmail}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!email}
                        aria-label="Add email to invite list"
                      >
                        + Add
                      </motion.button>
                    </div>

                    <div className="flex flex-col gap-4">
                      <p className="text-text-secondary text-lg">
                        You can always add users later on
                      </p>
                      <div className="flex justify-end gap-2">
                        <motion.button
                          className="border-2 border-accent-primary bg-bg-dark text-text-primary text-lg py-2 px-6 rounded-lg font-semibold"
                          onClick={handleClose}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label="Cancel project creation"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          className="w-32 bg-accent-primary ml-2 text-text-primary py-2 px-6 rounded-lg font-semibold disabled:bg-bg-card flex items-center gap-2"
                          onClick={handleCreate}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={loading}
                          aria-label="Create project and send invitations"
                        >
                          {loading ? 'Create' : 'Create'}
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {popup.show && (
                  <motion.div
                    className={`absolute bottom-4 left-6 px-4 py-2 rounded-lg shadow-lg text-text-primary ${
                      popup.message.includes('Failed') ? 'bg-error' : 'bg-success'
                    }`}
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
                className="h-full bg-bg-card flex items-center justify-center"
                role="img"
                aria-label="Placeholder image for project creation"
              >
                <span className="text-text-secondary text-lg">Image Placeholder</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateProjectDrawer;