import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useProjects } from '../../../contexts/ProjectContext.jsx';
import { useUser } from '../../../contexts/UserContext.jsx';

const generateDisplayProjectId = (projectName) => {
  if (!projectName || projectName.trim() === '') return '';
  const namePart = projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const finalNamePart = namePart || 'project';
  const randomChars = Math.random().toString(36).substring(2, 12);
  return `${finalNamePart}-${randomChars}`;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidProjectKeyFormat = (key) => /^[A-Z]{4}$/.test(key);

const CreateProjectDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { createProject, loadingCreate: projectCreationLoading, errorCreate: projectCreationError } = useProjects();
  
  // --- THIS IS THE FIX ---
  // We get the loading state from useUser and rename it to avoid conflicts.
  const { firebaseUser, getUserByEmail, loading: userLoading } = useUser();
  // ----------------------

  const [step, setStep] = useState('create');
  const [projectName, setProjectName] = useState('');
  const [userInputProjectKey, setUserInputProjectKey] = useState('');
  const [projectKeyError, setProjectKeyError] = useState('');
  const [generatedDisplayId, setGeneratedDisplayId] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('');
  const [currentPhase, setCurrentPhase] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [complexityLevel, setComplexityLevel] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [popup, setPopup] = useState({ show: false, message: '', type: 'info' });
  const [invitedUsers, setInvitedUsers] = useState([]);

  // Define handleClose function early to avoid hoisting issues
  const handleClose = () => {
    setProjectName('');
    setUserInputProjectKey('');
    setProjectKeyError('');
    setGeneratedDisplayId('');
    setDescription('');
    setProjectType('');
    setCurrentPhase('');
    setTeamSize('');
    setComplexityLevel('');
    setEmail('');
    setEmailError('');
    setPopup({ show: false, message: '', type: 'info' });
    setStep('create');
    setInvitedUsers([]);
    onClose();
  };

  // Step completion tracking
  const isStep1Complete = projectName.trim() && userInputProjectKey && !projectKeyError && generateDisplayProjectId(projectName.trim());
  const isStep2Complete = projectType && currentPhase && teamSize && complexityLevel;
  
  // Progress calculation
  const completedSteps = [
    isStep1Complete,
    isStep2Complete,
    step === 'invite' // Step 3 is considered complete when reached
  ].filter(Boolean).length;
  const progress = (completedSteps / 3) * 100;
  
  // Dynamic progress text
  const getProgressText = () => {
    if (completedSteps === 0) return "Let's start with the basics";
    if (completedSteps === 1) return "Great! Now add some details";
    if (completedSteps === 2) return "Almost done! Invite your team";
    return "Ready to create your project!";
  };

  // ESC key handler
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, handleClose]);

  useEffect(() => {
    setGeneratedDisplayId(generateDisplayProjectId(projectName));
  }, [projectName]);

  const handleNext = () => {
    let canProceed = true;
    const currentGeneratedId = generateDisplayProjectId(projectName.trim());

    if (step === 'create') {
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
      if (!currentGeneratedId && projectName.trim()) {
        setPopup({ show: true, message: 'Project Display ID could not be generated.', type: 'error' });
        canProceed = false;
      }

      if (canProceed) {
        setStep('details');
      }
    } else if (step === 'details') {
      if (!projectType) {
        setPopup({ show: true, message: 'Project Type is required.', type: 'error' });
        canProceed = false;
      }
      if (!currentPhase) {
        setPopup({ show: true, message: 'Current Project Phase is required.', type: 'error' });
        canProceed = false;
      }
      if (!teamSize || teamSize < 1) {
        setPopup({ show: true, message: 'Team Size must be at least 1.', type: 'error' });
        canProceed = false;
      }
      if (!complexityLevel) {
        setPopup({ show: true, message: 'Project Complexity Level is required.', type: 'error' });
        canProceed = false;
      }

      if (canProceed) {
        setStep('invite');
      }
    }
  };

  const handleAddEmail = async () => {
    if (!email) return setEmailError('Please fill in this field');
    if (!isValidEmail(email)) return setEmailError('Incorrect email format');

    const lowercasedEmail = email.toLowerCase();
    const exists = invitedUsers.some(u => u.email === lowercasedEmail);
    if (exists) return setPopup({ show: true, message: 'Email already added.', type: 'info' });

    try {
      const data = await getUserByEmail(lowercasedEmail);
      const user = data.exists
        ? { email: lowercasedEmail, name: `${data.first_name} ${data.last_name}`, photo: data.photo_url }
        : { email: lowercasedEmail };

      setInvitedUsers(prev => [...prev, user]);
      setEmail('');
      setPopup({ show: true, message: `Added ${lowercasedEmail}`, type: 'info' });
    } catch (err) {
      console.error('Error checking email:', err);
      setPopup({ show: true, message: err.message || 'Error validating email.', type: 'error' });
    }
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
    // This check is still good as a first line of defense.
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
      handleProjectKeyChange(userInputProjectKey);
      setPopup({ show: true, message: 'Project Key must be 4 valid uppercase letters.', type: 'error' });
      return;
    }

    const payload = {
      projectName: trimmedProjectName,
      projectKey: userInputProjectKey.toUpperCase(),
      description: description.trim(),
      projectType,
      currentPhase,
      teamSize: parseInt(teamSize),
      complexityLevel,
      inviteEmails: invitedUsers.map(u => u.email)
    };

    try {
      const newProject = await createProject(payload);
      if (newProject && newProject.projectUrl) {
        setPopup({ show: true, message: 'Project created successfully!', type: 'success' });
        setTimeout(() => {
          handleClose();
          navigate(`/projects/${newProject.projectUrl}`);
        }, 1500);
      } else {
        throw new Error('Failed to get project URL after creation.');
      }
    } catch (err) {
      console.error('Error in handleCreate:', err);
      setPopup({ show: true, message: projectCreationError || err.message || 'Failed to create project', type: 'error' });
    }
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
        <motion.div className="fixed inset-0 z-50 pointer-events-none font-poppins">
          <motion.div className="fixed inset-0 bg-black/30 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} />
          <motion.div 
            className="fixed inset-0 z-50 flex bg-bg-primary shadow-xl pointer-events-auto"
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }} 
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Subtle animated background shapes */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              <motion.div 
                className="absolute top-10 left-10 w-32 h-32 bg-pink-400/10 rounded-full blur-2xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-400/10 rounded-full blur-2xl"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
              <motion.div 
                className="absolute top-1/3 left-1/4 w-24 h-24 bg-fuchsia-400/8 rounded-full blur-2xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.4, 0.2],
                  x: [0, 20, 0],
                  y: [0, -10, 0]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
              />
              <motion.div 
                className="absolute bottom-1/3 left-10 w-28 h-28 bg-cyan-400/8 rounded-full blur-2xl"
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.15, 0.35, 0.15],
                  x: [0, -15, 0],
                  y: [0, 15, 0]
                }}
                transition={{ 
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 3.5
                }}
              />
            </div>

            <div className="w-full flex flex-col relative overflow-y-auto">
              {/* Header with navigation */}
              <div className="sticky top-0 bg-bg-primary z-10 border-b border-border-primary">
                <div className="max-w-4xl mx-auto px-8 py-6 flex items-center justify-between">
                  {step === 'create' ? (
                    <button 
                      className="text-text-secondary hover:text-text-primary text-2xl font-light" 
                      onClick={handleClose} 
                      aria-label="Close"
                    >
                      ×
                    </button>
                  ) : (
                    <button 
                      className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors" 
                      onClick={() => setStep(step === 'details' ? 'create' : 'details')}
                      aria-label="Go back"
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">Back</span>
                    </button>
                  )}
                  
                  {/* Step indicator */}
                  <div className="flex flex-col items-center gap-4">
                    {/* Step indicators */}
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        step === 'create' ? 'bg-accent-primary text-text-inverse' : 
                        isStep1Complete ? 'bg-success text-text-inverse' : 'bg-bg-tertiary text-text-secondary'
                      }`}>1</div>
                      <div className={`w-8 h-1 rounded-full transition-colors ${
                        isStep1Complete || ['details', 'invite'].includes(step) ? 'bg-accent-primary' : 'bg-bg-tertiary'
                      }`}></div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        step === 'details' ? 'bg-accent-primary text-text-inverse' : 
                        isStep2Complete ? 'bg-success text-text-inverse' : 
                        'bg-bg-tertiary text-text-secondary'
                      }`}>2</div>
                      <div className={`w-8 h-1 rounded-full transition-colors ${
                        step === 'invite' ? 'bg-accent-primary' : 'bg-bg-tertiary'
                      }`}></div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        step === 'invite' ? 'bg-accent-primary text-text-inverse' : 'bg-bg-tertiary text-text-secondary'
                      }`}>3</div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-48 flex flex-col items-center gap-2">
                      <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
                        <motion.div
                          className="h-2 bg-accent-primary rounded-full"
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, type: 'spring' }}
                        />
                      </div>
                      <p className="text-text-secondary text-xs font-medium">{getProgressText()}</p>
                    </div>
                  </div>
                  
                  <button 
                    className="text-text-secondary hover:text-text-primary text-2xl font-light" 
                    onClick={handleClose} 
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              {/* Main content */}
              <div className="flex-1 flex">
                {/* Left side - Future content */}
                <div className="w-80 flex items-center justify-center">
                  {/* Placeholder for future left side content */}
                </div>
                
                {/* Center - Form content */}
                <div className="flex-1 max-w-4xl mx-auto px-8 py-8">
                <AnimatePresence mode="wait">
                  {step === 'create' ? (
                    <motion.div key="create-step" variants={fieldVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
                      <div className="text-center mb-10">
                        <h2 className="text-text-primary text-4xl font-bold mb-3">Create Your Project</h2>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto">Start your collaborative journey by setting up a new project with some basic information.</p>
                      </div>
                      
                      <div className="space-y-6">
                      <div>
                        <label htmlFor="project-name" className="block text-text-primary text-lg font-medium mb-2">Project Name</label>
                        <input 
                          id="project-name" 
                          type="text" 
                          value={projectName} 
                          onChange={(e) => setProjectName(e.target.value)} 
                          className="w-full h-14 bg-bg-secondary text-text-primary rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-accent-primary border border-border-secondary hover:border-border-primary transition-colors" 
                          placeholder="Enter your project name" 
                          aria-required="true" 
                          disabled={projectCreationLoading || userLoading} 
                        />
                      </div>
                      <div>
                        <label htmlFor="project-key-input" className="block text-text-primary text-lg font-medium mb-2">Project Key <span className="text-xs text-text-secondary">(4 uppercase letters)</span></label>
                        <input 
                          id="project-key-input" 
                          type="text" 
                          value={userInputProjectKey} 
                          onChange={(e) => handleProjectKeyChange(e.target.value)} 
                          className={`w-full h-14 bg-bg-secondary text-text-primary rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 border transition-colors ${
                            projectKeyError ? 'ring-error border-error' : 'focus:ring-accent-primary border-border-secondary hover:border-border-primary'
                          }`} 
                          placeholder="E.g., PROJ" 
                          aria-required="true" 
                          maxLength={4} 
                          disabled={projectCreationLoading || userLoading} 
                        />
                        {projectKeyError && <motion.p className="text-error text-xs mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{projectKeyError}</motion.p>}
                      </div>
                      <div>
                        <label className="block text-text-primary text-lg font-medium mb-2">Generated Project ID</label>
                        <div className="bg-bg-card border border-border-secondary rounded-xl px-4 py-3">
                          <div className="text-lg font-mono text-text-primary select-all">
                            {generatedDisplayId || <span className="italic text-text-secondary">Enter Project Name above</span>}
                          </div>
                          <p className="text-sm text-text-tertiary mt-1">This unique identifier will be used in your project URL</p>
                        </div>
                      </div>
                      </div>
                    </motion.div>
                  ) : step === 'details' ? (
                    <motion.div key="details-step" variants={fieldVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
                      <div className="text-center mb-10">
                        <h2 className="text-text-primary text-4xl font-bold mb-3">Project Details</h2>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto">Provide additional context for "<span className="text-accent-primary font-semibold">{projectName}</span>" to help AI generate better tasks and recommendations.</p>
                      </div>
                      
                      <div className="space-y-6">
                      <div>
                        <label htmlFor="project-description" className="block text-text-primary text-lg font-medium mb-2">Project Description <span className="text-sm text-text-secondary">(Optional)</span></label>
                        <textarea 
                          id="project-description" 
                          value={description} 
                          onChange={(e) => setDescription(e.target.value)} 
                          className="w-full h-32 bg-bg-secondary text-text-primary rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-accent-primary border border-border-secondary hover:border-border-primary transition-colors resize-none" 
                          placeholder="Describe your project goals, objectives, and key deliverables..." 
                          disabled={projectCreationLoading || userLoading} 
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="project-type" className="block text-text-primary text-lg font-medium mb-2">Project Type</label>
                        <select 
                          id="project-type" 
                          value={projectType} 
                          onChange={(e) => setProjectType(e.target.value)} 
                          className="w-full h-14 bg-bg-secondary text-text-primary rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-accent-primary border border-border-secondary hover:border-border-primary transition-colors" 
                          disabled={projectCreationLoading || userLoading}
                        >
                          <option value="">Select project type</option>
                          <option value="Software Development">Software Development</option>
                          <option value="Marketing Campaign">Marketing Campaign</option>
                          <option value="Event Planning">Event Planning</option>
                          <option value="Product Launch">Product Launch</option>
                          <option value="Research Project">Research Project</option>
                          <option value="Content Creation">Content Creation</option>
                          <option value="Design Project">Design Project</option>
                          <option value="Business Strategy">Business Strategy</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="current-phase" className="block text-text-primary text-lg font-medium mb-2">Current Project Phase</label>
                        <select 
                          id="current-phase" 
                          value={currentPhase} 
                          onChange={(e) => setCurrentPhase(e.target.value)} 
                          className="w-full h-14 bg-bg-secondary text-text-primary rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-accent-primary border border-border-secondary hover:border-border-primary transition-colors" 
                          disabled={projectCreationLoading || userLoading}
                        >
                          <option value="">Select current phase</option>
                          <option value="Planning">Planning</option>
                          <option value="Development">Development</option>
                          <option value="Testing">Testing</option>
                          <option value="Launch">Launch</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Review">Review</option>
                        </select>
                      </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="team-size" className="block text-text-primary text-lg font-medium mb-2">Team Size</label>
                        <input 
                          id="team-size" 
                          type="number" 
                          min="1" 
                          value={teamSize} 
                          onChange={(e) => setTeamSize(e.target.value)} 
                          className="w-full h-14 bg-bg-secondary text-text-primary rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-accent-primary border border-border-secondary hover:border-border-primary transition-colors" 
                          placeholder="Enter team size" 
                          disabled={projectCreationLoading || userLoading} 
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="complexity-level" className="block text-text-primary text-lg font-medium mb-2">Project Complexity Level</label>
                        <select 
                          id="complexity-level" 
                          value={complexityLevel} 
                          onChange={(e) => setComplexityLevel(e.target.value)} 
                          className="w-full h-14 bg-bg-secondary text-text-primary rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-accent-primary border border-border-secondary hover:border-border-primary transition-colors" 
                          disabled={projectCreationLoading || userLoading}
                        >
                          <option value="">Select complexity level</option>
                          <option value="Simple">Simple</option>
                          <option value="Medium">Medium</option>
                          <option value="Complex">Complex</option>
                        </select>
                      </div>
                      </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="invite-step" variants={fieldVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
                      <div className="text-center mb-10">
                        <h2 className="text-text-primary text-4xl font-bold mb-3">Invite Team Members</h2>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto">Invite team members to collaborate on "<span className="text-accent-primary font-semibold">{projectName}</span>" (Key: <span className="font-mono text-accent-primary">{userInputProjectKey}</span>).</p>
                      </div>
                      
                      <div className="space-y-6">
                      <div>
                        <label htmlFor="email" className="block text-text-primary text-lg font-medium mb-2">Email Address</label>
                        <div className="flex gap-3">
                        <div className="flex-1">
                          <input 
                            id="email" 
                            type="email" 
                            value={email} 
                            onChange={(e) => handleEmailChange(e.target.value)} 
                            className="w-full h-14 bg-bg-secondary text-text-primary rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-accent-primary border border-border-secondary hover:border-border-primary transition-colors" 
                            placeholder="Enter email address" 
                            disabled={projectCreationLoading || userLoading} 
                          />
                          {emailError && <motion.p className="text-error text-sm mt-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>{emailError}</motion.p>}
                        </div>
                        <motion.button 
                          className="bg-accent-primary hover:bg-accent-hover text-text-inverse h-14 px-6 rounded-xl font-semibold transition-colors shadow-lg" 
                          onClick={handleAddEmail} 
                          disabled={!email || !!emailError || projectCreationLoading || userLoading}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Add User
                        </motion.button>
                        </div>
                        <p className="text-text-tertiary text-sm mt-2 bg-bg-card rounded-lg px-4 py-3 border border-border-secondary">
                          💡 <strong>Tip:</strong> You don't need to add users now. You can always invite team members later. You can create a project without adding anyone initially.
                        </p>
                      </div>
                      
                      {invitedUsers.length > 0 && (
                        <div>
                          <h3 className="text-text-primary text-lg font-medium mb-4">Invited Users ({invitedUsers.length})</h3>
                          <div className="space-y-3">
                            {invitedUsers.map((u, i) => (
                              <motion.div 
                                key={u.email} 
                                className="flex items-center gap-4 bg-bg-card px-4 py-3 rounded-xl border border-border-secondary hover:border-border-primary transition-colors"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                              >
                                {u.photo ? (
                                  <img src={u.photo} alt={u.name || u.email} className="w-10 h-10 rounded-full" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary font-bold text-lg">
                                    {u.email[0]?.toUpperCase()}
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="text-text-primary font-medium">{u.name || u.email}</div>
                                  {u.name && <div className="text-text-secondary text-sm">{u.email}</div>}
                                </div>
                                <button 
                                  className="text-error hover:text-error/80 text-sm font-medium px-3 py-1 rounded-lg hover:bg-error/10 transition-colors" 
                                  onClick={() => setInvitedUsers(prev => prev.filter((_u, j) => j !== i))}
                                >
                                  Remove
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>
                
                {/* Right side - Action button */}
                <div className="w-80 flex items-center justify-center relative">
                  {step === 'create' && (
                    <motion.button
                      className={`w-full h-full bg-bg-primary flex items-center justify-center group ${
                        !isStep1Complete || projectCreationLoading || userLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                      } relative z-10`}
                      onClick={handleNext}
                      disabled={!isStep1Complete || projectCreationLoading || userLoading}
                    >
                      <div className="flex items-center gap-4">
                        <motion.span
                          className="text-text-secondary group-hover:text-accent-primary text-2xl font-semibold transition-colors"
                          whileHover={{ scale: 1.1 }}
                        >
                          Continue to Details
                        </motion.span>
                        <motion.div
                          className="text-text-secondary group-hover:text-accent-primary text-2xl transition-colors"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.6, 1, 0.6]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          →
                        </motion.div>
                      </div>
                    </motion.button>
                  )}
                  
                  {step === 'details' && (
                    <motion.button
                      className={`w-full h-full bg-bg-primary flex items-center justify-center group ${
                        !isStep2Complete || projectCreationLoading || userLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                      } relative z-10`}
                      onClick={handleNext}
                      disabled={!isStep2Complete || projectCreationLoading || userLoading}
                    >
                      <div className="flex items-center gap-4">
                        <motion.span
                          className="text-text-secondary group-hover:text-accent-primary text-2xl font-semibold transition-colors"
                          whileHover={{ scale: 1.1 }}
                        >
                          Continue to Invitations
                        </motion.span>
                        <motion.div
                          className="text-text-secondary group-hover:text-accent-primary text-2xl transition-colors"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.6, 1, 0.6]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          →
                        </motion.div>
                      </div>
                    </motion.button>
                  )}
                  
                  {step === 'invite' && (
                    <motion.button
                      className={`w-full h-full bg-bg-primary flex items-center justify-center group ${
                        projectCreationLoading || userLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                      } relative z-10`}
                      onClick={handleCreate}
                      disabled={projectCreationLoading || userLoading}
                    >
                      <div className="flex items-center gap-4">
                        <motion.span
                          className="text-text-secondary group-hover:text-success text-2xl font-semibold transition-colors flex items-center gap-3"
                          whileHover={{ scale: 1.1 }}
                        >
                          {projectCreationLoading || userLoading ? (
                            <>
                              <div className="w-6 h-6 border-2 border-text-secondary/30 border-t-text-secondary rounded-full animate-spin"></div>
                              Creating Project...
                            </>
                          ) : (
                            'Create Project'
                          )}
                        </motion.span>
                        {!projectCreationLoading && !userLoading && (
                          <motion.div
                            className="text-text-secondary group-hover:text-success text-2xl transition-colors"
                            animate={{ 
                              scale: [1, 1.2, 1],
                              opacity: [0.6, 1, 0.6]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            ✨
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  )}

                  {/* Glowing accent animation on the rightmost edge to guide users */}
                  <motion.div
                    className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-32 rounded-l-2xl"
                    animate={{ 
                      boxShadow: [
                        '0 0 0 0 rgba(167, 139, 250, 0)',
                        '-10px 0 30px 5px rgba(167, 139, 250, 0.4)',
                        '-20px 0 50px 10px rgba(167, 139, 250, 0.3)',
                        '-10px 0 30px 5px rgba(167, 139, 250, 0.4)',
                        '0 0 0 0 rgba(167, 139, 250, 0)'
                      ],
                      background: [
                        'rgba(167, 139, 250, 0)',
                        'rgba(167, 139, 250, 0.1)',
                        'rgba(167, 139, 250, 0.2)',
                        'rgba(167, 139, 250, 0.1)',
                        'rgba(167, 139, 250, 0)'
                      ]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Additional subtle pulse on the right edge */}
                  <motion.div
                    className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-20 bg-accent-primary/10 rounded-l-xl"
                    animate={{ 
                      opacity: [0, 0.5, 0],
                      scaleY: [0.8, 1.1, 0.8],
                      scaleX: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                  />
                </div>
              </div>
              
              {/* Popup notifications */}
              <AnimatePresence>
                {popup.show && (
                  <motion.div 
                    className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-xl shadow-lg text-text-inverse text-lg font-medium z-20 ${
                      popup.type === 'error' ? 'bg-error' : popup.type === 'success' ? 'bg-success' : 'bg-info'
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateProjectDrawer;