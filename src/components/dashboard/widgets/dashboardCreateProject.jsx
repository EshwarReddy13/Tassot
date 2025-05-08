import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// REMOVE: Old documents provider hook import
// import { useDocuments } from '../../global widgets/documentProvider.jsx';
// ADD: New project context hook import
import { useProjects } from '../../../contexts/projectContext.jsx'; // Adjust path as needed
import { useUser } from '../../../contexts/userContext.jsx'; // Adjust path as needed

// Keep original function name, though it generates a key
const generateProjectId = (projectName) => {
  const randomChars = Math.random().toString(36).substring(2, 12);
  return `${projectName.toLowerCase().replace(/\s+/g, '-')}-${randomChars}`;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const CreateProjectDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  // REMOVE: Old hook call
  // const { createProject, error: documentError, loading } = useDocuments();
  // ADD: New hook call
  const { createProject, loadingCreate: projectCreationLoading, errorCreate: projectCreationError } = useProjects();
  // Get firebaseUser for auth check, keep userData if needed elsewhere (though not used in create logic now)
  const { userData, firebaseUser } = useUser();

  // Keep all original state variables
  const [step, setStep] = useState('create');
  const [projectName, setProjectName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  // Add 'type' to popup state for consistent styling (info, success, error)
  const [popup, setPopup] = useState({ show: false, message: '', type: 'info' });
  // Keep original variable name, but understand it's the projectKey
  const projectId = projectName ? generateProjectId(projectName) : '';

  // Keep original handleNext
  const handleNext = () => {
    if (projectName) {
      setStep('invite');
    }
  };

  // Keep original handleAddEmail (Invite step UI only)
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
    // NOTE: This popup is just UI feedback. No invite is actually sent or saved yet.
    setPopup({ show: true, message: `Email added to invite list: ${email}`, type: 'info' });
    setEmail('');
  };

  // Keep original handleEmailChange
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

  // UPDATE: handleCreate logic
  const handleCreate = async () => {
    // Use firebaseUser for auth check
    if (!firebaseUser) {
      setPopup({ show: true, message: 'You must be logged in to create a project', type: 'error' });
      return;
    }
    // Use generated projectId as the projectKey
    const projectKey = projectId;
     if (!projectName.trim() || !projectKey) {
       setPopup({ show: true, message: 'Project Name is required to generate a Project Key.', type: 'error' });
       return;
    }

    try {
      // Call the createProject function from useProjects context
      // Pass the necessary details
      const newProject = await createProject({ projectName: projectName.trim(), projectKey });
      setPopup({ show: true, message: 'Project created successfully!', type: 'success' });
      setTimeout(() => {
        handleClose();
         // Use the projectKey from the response for navigation
        navigate(`/projects/${newProject.projectKey}`);
      }, 2000); // Original timeout duration
    } catch (err) {
       // Use the error from the context or the caught error
      setPopup({ show: true, message: projectCreationError || err.message || 'Failed to create project', type: 'error' });
    }
  };

  // Keep original handleClose
  const handleClose = () => {
    setProjectName('');
    // Note: projectId derives from projectName, no separate reset needed
    setEmail('');
    setEmailError('');
    setPopup({ show: false, message: '', type: 'info' });
    setStep('create');
    onClose();
  };

  // Keep original useEffect for popup timer
  useEffect(() => {
    if (popup.show) {
      const timer = setTimeout(() => {
        setPopup({ show: false, message: '', type: 'info' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [popup.show]);

  // Keep original variants
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

  // --- RETURN JSX (Keep original structure and UI) ---
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none font-poppins" // Original classes
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }} // Original transition
        >
          {/* Added backdrop from my previous attempt, assuming it's desired for usability */}
          <motion.div
              className="fixed inset-0 bg-black/30 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose} // Close drawer when clicking backdrop
            />
          {/* Original drawer content structure */}
          <div className="relative z-50 flex h-full w-full max-w-xl md:max-w-2xl lg:max-w-3xl bg-[#292830] shadow-xl pointer-events-auto ml-auto"> {/* Ensure drawer is on the right */}
             {/* Left Side (Form) */}
            <div className="w-full md:w-1/2 flex flex-col pt-4 sm:pt-6 pl-4 sm:pl-6 pr-4 relative overflow-y-auto"> {/* Adjusted slightly for responsiveness from prev attempt */}
              <button
                className="text-gray-400 hover:text-white text-3xl mb-4 sm:mb-5 self-start" // Adjusted styling slightly from prev attempt
                onClick={handleClose}
                aria-label="Close drawer"
              >
                &times; {/* Using times symbol */}
              </button>

              <AnimatePresence mode="wait">
                {step === 'create' ? (
                  <motion.div
                    key="create-step"
                    variants={fieldVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex flex-col flex-grow" // Use flex-grow for layout
                  >
                    {/* --- Create Step UI (Original Structure) --- */}
                    <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-left"> {/* Adjusted sizes slightly */}
                      Create Your Project
                    </h2>
                    <p className="text-gray-400 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 text-left"> {/* Adjusted sizes slightly */}
                      Start your collaborative journey by setting up a new project.
                    </p>
                    <div className="mb-4 sm:mb-5"> {/* Adjusted sizes slightly */}
                      <label
                        htmlFor="project-name"
                        className="block text-white text-base sm:text-lg font-medium mb-1 sm:mb-2 text-left" // Adjusted sizes slightly
                      >
                        Enter your new Project Name
                      </label>
                      <input
                        id="project-name"
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        // Use original classes, disable based on context loading state
                        className="w-full h-11 sm:h-12 bg-[#161616] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9674da] disabled:opacity-50"
                        placeholder="Enter project name"
                        aria-required="true"
                        disabled={projectCreationLoading} // Disable if creating project
                      />
                    </div>
                    <div className="mb-6 sm:mb-8"> {/* Adjusted sizes slightly */}
                      <label
                        htmlFor="project-id-display" // Changed id to avoid clash if input existed
                        className="block text-white text-base sm:text-lg font-medium mb-1 sm:mb-2 text-left" // Adjusted sizes slightly
                      >
                        Project ID {/* Changed label text to Key */}
                      </label>
                      <div
                        id="project-id-display"
                        // Use original classes
                        className="inline-block text-base sm:text-lg bg-[#161616] text-gray-400 rounded-full px-4 py-2 cursor-not-allowed select-all" // Use select-all utility if needed
                        aria-readonly="true"
                        title={projectId || 'Unique key generated automatically'} // Use projectId (the key)
                      >
                        {/* Use projectId (the key) */}
                        {projectId || <span className="italic">Generated automatically</span>}
                      </div>
                       <p className="text-xs text-gray-500 mt-1">Unique identifier for your project.</p>
                    </div>
                     {/* Keep original button layout structure */}
                    <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-4"> {/* mt-auto pushes to bottom */}
                      <p className="text-gray-400 text-sm sm:text-base text-left order-2 sm:order-1"> {/* Original classes */}
                        Already have a project?{' '}
                        <button
                          className="text-[#9674da] hover:underline focus:outline-none" // Original classes
                          onClick={() => navigate('/join-project')}
                          aria-label="Join an existing project"
                        >
                           Join a project
                        </button>
                      </p>
                      <div className="sm:ml-auto order-1 sm:order-2 w-full sm:w-auto">
                        <motion.button
                          // Use original classes, disable based on projectName only
                          className="w-full sm:w-auto bg-[#9674da] text-white text-base sm:text-lg py-2 px-5 sm:px-6 rounded-lg font-semibold hover:bg-[#7e5cb7] disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          onClick={handleNext}
                          whileHover={!projectName ? {} : { scale: 1.05 }} // Original condition
                          whileTap={!projectName ? {} : { scale: 0.95 }}
                          disabled={!projectName || projectCreationLoading} // Also disable if creating
                          aria-label="Proceed to invite users"
                        >
                          Next
                           <img // Original icon and classes
                              src="https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/arrow_circle_left/materialsymbolsoutlined/arrow_circle_left_24px.svg"
                              alt="" // Decorative
                              className="w-6 h-6 sm:w-8 sm:h-8 invert scale-x-[-1]" // Adjusted size slightly
                            />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ) : ( // step === 'invite'
                  <motion.div
                    key="invite-step"
                    variants={fieldVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex flex-col flex-grow" // Use flex-grow
                  >
                    {/* --- Invite Step UI (Original Structure) --- */}
                    <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-left"> {/* Adjusted sizes slightly */}
                      Invite Users <span className="text-lg text-gray-500">(Optional)</span>
                    </h2>
                    <p className="text-gray-400 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 text-left"> {/* Adjusted sizes slightly */}
                      Invite team members now or add them later from project settings.
                    </p>
                    <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row items-end gap-2"> {/* Adjusted sizes slightly */}
                       <div className="flex-grow w-full">
                          <label
                            htmlFor="email"
                            className="block text-white text-base sm:text-lg font-medium mb-1 sm:mb-2 text-left" // Adjusted sizes slightly
                          >
                            Enter Email Address
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => handleEmailChange(e.target.value)}
                            // Use original classes, disable if creating project
                            className="w-full h-11 sm:h-12 bg-[#161616] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9674da] disabled:opacity-50"
                            placeholder="Enter an email address"
                            aria-required="false"
                            aria-describedby={emailError ? 'email-error' : undefined}
                            disabled={projectCreationLoading} // Disable if creating
                          />
                          {emailError && (
                            <motion.p // Keep original error display
                              id="email-error"
                              className="text-red-400 text-xs mt-1" // Adjusted size slightly
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
                        // Use original classes, disable based on email/error
                        className="w-full sm:w-auto bg-[#9674da] h-11 sm:h-12 text-base sm:text-lg text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#7e5cb7] disabled:bg-gray-600 disabled:cursor-not-allowed flex-shrink-0"
                        onClick={handleAddEmail}
                        whileHover={!email || !!emailError || projectCreationLoading ? {} : { scale: 1.05 }} // Original conditions + loading
                        whileTap={!email || !!emailError || projectCreationLoading ? {} : { scale: 0.95 }}
                        disabled={!email || !!emailError || projectCreationLoading} // Original conditions + loading
                        aria-label="Add email to invite list"
                      >
                        + Add
                      </motion.button>
                    </div>
                     {/* Keep original button layout structure */}
                    <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-4"> {/* mt-auto */}
                      <p className="text-gray-400 text-sm sm:text-base order-2 sm:order-1"> {/* Original classes */}
                        You can always add users later on.
                      </p>
                      <div className="sm:ml-auto order-1 sm:order-2 w-full sm:w-auto">
                        <motion.button
                           // Use original classes, disable based on context loading state
                          className="w-full sm:w-auto bg-[#9674da] text-white text-base sm:text-lg py-2 px-5 sm:px-6 rounded-lg font-semibold hover:bg-[#7e5cb7] disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          onClick={handleCreate}
                          whileHover={projectCreationLoading ? {} : { scale: 1.05 }} // Use context loading state
                          whileTap={projectCreationLoading ? {} : { scale: 0.95 }}
                          disabled={projectCreationLoading} // Use context loading state
                          aria-label="Create project"
                        >
                          {/* Use context loading state */}
                          {projectCreationLoading ? 'Creating...' : 'Create Project'}
                          <img // Keep original icon
                            src="https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/arrow_circle_left/materialsymbolsoutlined/arrow_circle_left_24px.svg"
                            alt="" // Decorative
                            className="w-6 h-6 sm:w-8 sm:h-8 invert scale-x-[-1]" // Adjusted size slightly
                          />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Popup Notification Area (Kept from previous attempt for consistency) */}
              <AnimatePresence>
                {popup.show && (
                  <motion.div
                    className={`absolute bottom-4 left-6 right-6 sm:left-auto px-4 py-2 rounded-lg shadow-lg text-white text-sm z-10 ${
                      popup.type === 'error' ? 'bg-red-600' : popup.type === 'success' ? 'bg-green-600' : 'bg-blue-600'
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

            </div>{/* End Left Side */}

            {/* Right Side (Image Placeholder - Kept original) */}
             <div className="hidden md:flex w-1/2 bg-[#1e1d25] items-center justify-center overflow-hidden"> {/* Use original background color */}
               <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                   <span className="text-gray-400 text-lg">Image Placeholder</span>
                   {/* Or use an actual image */}
                   {/* <img src="/path/to/your/image.png" alt="Project Creation Visual" className="w-auto h-auto max-w-full max-h-full opacity-80"/> */}
               </motion.div>
            </div>

          </div> {/* End Drawer Content */}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateProjectDrawer;