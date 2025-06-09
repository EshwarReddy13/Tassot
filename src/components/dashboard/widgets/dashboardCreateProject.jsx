// src/components/dashboard/widgets/dashboardCreateProject.jsx (or your actual path)
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../../contexts/ProjectContext.jsx'; // Adjust path
import { useUser } from '../../../contexts/UserContext.jsx'; // Adjust path

const generateDisplayProjectId = (projectName) => {
  if (!projectName || projectName.trim() === '') return '';
  const namePart = projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  // Ensure namePart is not empty after sanitization, or provide a default
  const finalNamePart = namePart || 'project';
  const randomChars = Math.random().toString(36).substring(2, 12);
  return `${finalNamePart}-${randomChars}`;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidProjectKeyFormat = (key) => /^[A-Z]{4}$/.test(key);

const CreateProjectDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { createProject, loadingCreate: projectCreationLoading, errorCreate: projectCreationError } = useProjects();
  const { firebaseUser } = useUser();

  const [step, setStep] = useState('create');
  const [projectName, setProjectName] = useState('');
  const [userInputProjectKey, setUserInputProjectKey] = useState('');
  const [projectKeyError, setProjectKeyError] = useState('');
  const [generatedDisplayId, setGeneratedDisplayId] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [popup, setPopup] = useState({ show: false, message: '', type: 'info' });

  useEffect(() => {
    setGeneratedDisplayId(generateDisplayProjectId(projectName));
  }, [projectName]);

  const handleNext = () => {
    let canProceed = true;
    const currentGeneratedId = generateDisplayProjectId(projectName.trim()); // Check with current value

    if (!projectName.trim()) {
        setPopup({ show: true, message: 'Project Name is required.', type: 'error' });
        canProceed = false;
    }
    if (!userInputProjectKey || !isValidProjectKeyFormat(userInputProjectKey)) {
        setProjectKeyError('Project Key must be 4 uppercase letters.');
        canProceed = false;
    } else {
        setProjectKeyError('');
    }
    // Check the re-evaluated generated ID based on the current project name
    if (!currentGeneratedId && projectName.trim()) {
        setPopup({ show: true, message: 'Project Display ID could not be generated from the current Project Name.', type: 'error' });
        canProceed = false;
    }

    if (canProceed) {
      setStep('invite');
    }
  };

  const handleAddEmail = () => {
    if (!email) { setEmailError('Please fill in this field'); return; }
    if (!isValidEmail(email)) { setEmailError('Incorrect email format'); return; }
    setEmailError('');
    setPopup({ show: true, message: `Email added to invite list: ${email}`, type: 'info' });
    setEmail('');
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (!value) setEmailError('Please fill in this field');
    else if (!isValidEmail(value)) setEmailError('Incorrect email format');
    else setEmailError('');
  };

  const handleProjectKeyChange = (value) => {
    const upperValue = value.substring(0, 4).toUpperCase();
    setUserInputProjectKey(upperValue);
    if (!upperValue) setProjectKeyError('Please fill in this field.');
    else if (!isValidProjectKeyFormat(upperValue)) setProjectKeyError('Must be 4 uppercase letters.');
    else setProjectKeyError('');
  };

  const handleCreate = async () => {
    if (!firebaseUser) {
      setPopup({ show: true, message: 'You must be logged in to create a project', type: 'error' });
      return;
    }
    const trimmedProjectName = projectName.trim();
    if (!trimmedProjectName) {
       setPopup({ show: true, message: 'Project Name is required.', type: 'error' });
       return;
    }
    if (!userInputProjectKey || !isValidProjectKeyFormat(userInputProjectKey)) {
        handleProjectKeyChange(userInputProjectKey); // Trigger validation display
        setPopup({ show: true, message: 'Project Key must be 4 valid uppercase letters.', type: 'error' });
        return;
    }
    setProjectKeyError(''); // Clear error if validation passes here

    // Re-generate/re-evaluate the ID here to ensure it's based on the final trimmedProjectName
    const finalGeneratedProjectId = generateDisplayProjectId(trimmedProjectName);
    if (!finalGeneratedProjectId) {
        setPopup({ show: true, message: 'Error generating project display ID. Ensure project name is valid.', type: 'error' });
        return;
    }

    const payload = {
      projectName: trimmedProjectName,
      projectKey: userInputProjectKey.toUpperCase(),
      projectUrl: finalGeneratedProjectId
    };

    try {
      const newProject = await createProject(payload);
      
      // ✨ FIX: Add a check to ensure newProject and newProject.projectUrl exist before navigating
      if (newProject && newProject.projectUrl) {
        setPopup({ show: true, message: 'Project created successfully!', type: 'success' });
        setTimeout(() => {
          handleClose();
          navigate(`/projects/${newProject.projectUrl}`);
        }, 1500);
      } else {
        // This will catch the error if the backend response is not what we expect
        console.error("API response missing 'projectUrl'. Response:", newProject);
        throw new Error('Failed to get project URL after creation.');
      }
    } catch (err) {
      console.error("Error in handleCreate:", err);
      setPopup({ show: true, message: projectCreationError || err.message || 'Failed to create project', type: 'error' });
    }
  };

  const handleClose = () => {
    setProjectName('');
    setUserInputProjectKey('');
    setProjectKeyError('');
    setGeneratedDisplayId('');
    setEmail('');
    setEmailError('');
    setPopup({ show: false, message: '', type: 'info' });
    setStep('create');
    onClose();
  };

  useEffect(() => {
    if (popup.show) {
      const timer = setTimeout(() => setPopup({ show: false, message: '', type: 'info' }), 3000);
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
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <motion.div
              className="fixed inset-0 bg-black/30 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleClose}
            />
          <div className="relative z-50 flex h-full w-full max-w-xl md:max-w-2xl lg:max-w-3xl bg-[#292830] shadow-xl pointer-events-auto ml-auto">
            <div className="w-full md:w-1/2 flex flex-col pt-4 smt-6 pl-4 sm:pl-6 pr-4 relative overflow-y-auto">
              <button
                className="text-gray-400 hover:text-white text-3xl mb-4 sm:mb-5 self-start"
                onClick={handleClose} aria-label="Close drawer"
              >
                &times;
              </button>

              <AnimatePresence mode="wait">
                {step === 'create' ? (
                  <motion.div key="create-step" variants={fieldVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col flex-grow">
                    <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-left">Create Your Project</h2>
                    <p className="text-gray-400 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 text-left">Start your collaborative journey by setting up a new project.</p>

                    <div className="mb-4 sm:mb-5">
                      <label htmlFor="project-name" className="block text-white text-base sm:text-lg font-medium mb-1 sm:mb-2 text-left">Project Name</label>
                      <input
                        id="project-name" type="text" value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full h-11 sm:h-12 bg-[#161616] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9674da] disabled:opacity-50"
                        placeholder="Enter project name" aria-required="true"
                        disabled={projectCreationLoading}
                      />
                    </div>

                    <div className="mb-4 sm:mb-5">
                      <label htmlFor="project-key-input" className="block text-white text-base sm:text-lg font-medium mb-1 sm:mb-2 text-left">
                        Project Key <span className="text-xs text-gray-400">(4 uppercase letters)</span>
                      </label>
                      <input
                        id="project-key-input" type="text" value={userInputProjectKey}
                        onChange={(e) => handleProjectKeyChange(e.target.value)}
                        className={`w-full h-11 sm:h-12 bg-[#161616] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${projectKeyError ? 'ring-red-500' : 'focus:ring-[#9674da]'} disabled:opacity-50`}
                        placeholder="E.g., PROJ" aria-required="true" maxLength={4}
                        disabled={projectCreationLoading}
                      />
                      {projectKeyError && <motion.p className="text-red-400 text-xs mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{projectKeyError}</motion.p>}
                    </div>

                    <div className="mb-6 sm:mb-8">
                         <label className="block text-white text-base sm:text-lg font-medium mb-1 sm:mb-2 text-left">
                            Generated Project ID
                        </label>
                        <div
                          className="inline-block text-sm sm:text-base bg-[#101012] text-gray-400 rounded-full px-4 py-2 cursor-default select-all truncate"
                          title={generatedDisplayId || "Generated based on Project Name"}
                        >
                          {generatedDisplayId || <span className="italic">Enter Project Name above</span>}
                        </div>
                         <p className="text-xs text-gray-500 mt-1">This is a unique identifier generated for your project.</p>
                    </div>

                    <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                      <p className="text-gray-400 text-sm sm:text-base text-left order-2 sm:order-1">
                        Already have a project?{' '}
                        <button className="text-[#9674da] hover:underline focus:outline-none" onClick={() => navigate('/join-project')} aria-label="Join an existing project">
                           Join a project
                        </button>
                      </p>
                      <div className="sm:ml-auto order-1 sm:order-2 w-full sm:w-auto">
                        <motion.button
                          className="w-full sm:w-auto bg-[#9674da] text-white text-base sm:text-lg py-2 px-5 sm:px-6 rounded-lg font-semibold hover:bg-[#7e5cb7] disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          onClick={handleNext}
                          whileHover={(!projectName.trim() || !userInputProjectKey || !!projectKeyError || !generateDisplayProjectId(projectName.trim())) ? {} : { scale: 1.05 }}
                          whileTap={(!projectName.trim() || !userInputProjectKey || !!projectKeyError || !generateDisplayProjectId(projectName.trim())) ? {} : { scale: 0.95 }}
                          disabled={!projectName.trim() || !userInputProjectKey || !!projectKeyError || !generateDisplayProjectId(projectName.trim()) || projectCreationLoading}
                          aria-label="Proceed to invite users"
                        >
                          Next <img src="https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/arrow_circle_left/materialsymbolsoutlined/arrow_circle_left_24px.svg" alt="" className="w-6 h-6 sm:w-8 sm:h-8 invert scale-x-[-1]" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ) : ( // step === 'invite'
                  <motion.div key="invite-step" variants={fieldVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col flex-grow">
                    <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-left">Invite Users <span className="text-lg text-gray-500">(Optional)</span></h2>
                    <p className="text-gray-400 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 text-left">Invite team members for "{projectName}" (Key: {userInputProjectKey}).</p>
                    <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row items-end gap-2">
                       <div className="flex-grow w-full">
                          <label htmlFor="email" className="block text-white text-base sm:text-lg font-medium mb-1 sm:mb-2 text-left">Enter Email Address</label>
                          <input
                            id="email" type="email" value={email}
                            onChange={(e) => handleEmailChange(e.target.value)}
                            className="w-full h-11 sm:h-12 bg-[#161616] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9674da] disabled:opacity-50"
                            placeholder="Enter an email address" aria-required="false"
                            aria-describedby={emailError ? 'email-error' : undefined}
                            disabled={projectCreationLoading}
                          />
                          {emailError && <motion.p id="email-error" className="text-red-400 text-xs mt-1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }} role="alert">{emailError}</motion.p>}
                       </div>
                      <motion.button
                        className="w-full sm:w-auto bg-[#9674da] h-11 sm:h-12 text-base sm:text-lg text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#7e5cb7] disabled:bg-gray-600 disabled:cursor-not-allowed flex-shrink-0"
                        onClick={handleAddEmail}
                        whileHover={!email || !!emailError || projectCreationLoading ? {} : { scale: 1.05 }}
                        whileTap={!email || !!emailError || projectCreationLoading ? {} : { scale: 0.95 }}
                        disabled={!email || !!emailError || projectCreationLoading}
                        aria-label="Add email to invite list"
                      >
                        + Add
                      </motion.button>
                    </div>
                    <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                      <p className="text-gray-400 text-sm sm:text-base order-2 sm:order-1">You can always add users later on.</p>
                      <div className="sm:ml-auto order-1 sm:order-2 w-full sm:w-auto">
                        <motion.button
                          className="w-full sm:w-auto bg-[#9674da] text-white text-base sm:text-lg py-2 px-5 sm:px-6 rounded-lg font-semibold hover:bg-[#7e5cb7] disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          onClick={handleCreate}
                          whileHover={projectCreationLoading ? {} : { scale: 1.05 }}
                          whileTap={projectCreationLoading ? {} : { scale: 0.95 }}
                          disabled={projectCreationLoading}
                          aria-label="Create project"
                        >
                          {projectCreationLoading ? 'Creating...' : 'Create Project'}
                          <img src="https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/arrow_circle_left/materialsymbolsoutlined/arrow_circle_left_24px.svg" alt="" className="w-6 h-6 sm:w-8 sm:h-8 invert scale-x-[-1]" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {popup.show && (
                  <motion.div
                    className={`absolute bottom-4 left-6 right-6 sm:left-auto px-4 py-2 rounded-lg shadow-lg text-white text-sm z-10 ${
                      popup.type === 'error' ? 'bg-red-600' : popup.type === 'success' ? 'bg-green-600' : 'bg-blue-600'
                    }`}
                    variants={popupVariants} initial="initial" animate="animate" exit="exit"
                    aria-live="polite"
                  >
                    {popup.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="hidden md:flex w-1/2 bg-[#1e1d25] items-center justify-center overflow-hidden">
               <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
                   <span className="text-gray-400 text-lg">Image Placeholder</span>
               </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateProjectDrawer;