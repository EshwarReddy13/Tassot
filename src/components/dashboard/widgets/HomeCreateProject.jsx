import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <motion.div className="fixed inset-0 z-50 pointer-events-none font-poppins" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
          <motion.div className="fixed inset-0 bg-black/30 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} />
          <div className="relative z-50 flex h-full w-full max-w-3xl bg-[#292830] shadow-xl pointer-events-auto ml-auto">
            <div className="w-full flex flex-col pt-4 px-6 relative overflow-y-auto">
              <button className="text-gray-400 hover:text-white text-3xl mb-5 self-start" onClick={handleClose} aria-label="Close drawer">×</button>
              <AnimatePresence mode="wait">
                {step === 'create' ? (
                  <motion.div key="create-step" variants={fieldVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col flex-grow">
                    <h2 className="text-white text-3xl font-bold mb-2">Create Your Project</h2>
                    <p className="text-gray-400 text-base mb-6">Start your collaborative journey by setting up a new project.</p>
                    <div className="mb-5">
                      <label htmlFor="project-name" className="block text-white text-lg font-medium mb-2">Project Name</label>
                      <input id="project-name" type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full h-12 bg-[#161616] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9674da]" placeholder="Enter project name" aria-required="true" disabled={projectCreationLoading || userLoading} />
                    </div>
                    <div className="mb-5">
                      <label htmlFor="project-key-input" className="block text-white text-lg font-medium mb-2">Project Key <span className="text-xs text-gray-400">(4 uppercase letters)</span></label>
                      <input id="project-key-input" type="text" value={userInputProjectKey} onChange={(e) => handleProjectKeyChange(e.target.value)} className={`w-full h-12 bg-[#161616] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${projectKeyError ? 'ring-red-500' : 'focus:ring-[#9674da]'}`} placeholder="E.g., PROJ" aria-required="true" maxLength={4} disabled={projectCreationLoading || userLoading} />
                      {projectKeyError && <motion.p className="text-red-400 text-xs mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{projectKeyError}</motion.p>}
                    </div>
                    <div className="mb-6">
                      <label className="block text-white text-lg font-medium mb-2">Generated Project ID</label>
                      <div className="inline-block text-base bg-[#101012] text-gray-400 rounded-full px-4 py-2 select-all truncate">{generatedDisplayId || <span className="italic">Enter Project Name above</span>}</div>
                      <p className="text-xs text-gray-500 mt-1">This is a unique identifier generated for your project.</p>
                    </div>
                    <div className="mt-auto flex justify-end">
                      <motion.button className="bg-[#9674da] text-white text-lg py-2 px-6 rounded-lg font-semibold hover:bg-[#7e5cb7] disabled:bg-gray-600 disabled:cursor-not-allowed" onClick={handleNext} disabled={!projectName.trim() || !userInputProjectKey || !!projectKeyError || !generateDisplayProjectId(projectName.trim()) || projectCreationLoading || userLoading}>Next</motion.button>
                    </div>
                  </motion.div>
                ) : step === 'details' ? (
                  <motion.div key="details-step" variants={fieldVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col flex-grow">
                    <h2 className="text-white text-3xl font-bold mb-2">Project Details</h2>
                    <p className="text-gray-400 text-base mb-6">Provide additional context for "{projectName}" to help AI generate better tasks.</p>
                    
                    <div className="mb-5">
                      <label htmlFor="project-description" className="block text-white text-lg font-medium mb-2">Project Description <span className="text-xs text-gray-400">(Optional)</span></label>
                      <textarea id="project-description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-24 bg-[#161616] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9674da] resize-none" placeholder="Describe your project goals, objectives, and key deliverables..." disabled={projectCreationLoading || userLoading} />
                    </div>
                    
                    <div className="mb-5">
                      <label htmlFor="project-type" className="block text-white text-lg font-medium mb-2">Project Type</label>
                      <select id="project-type" value={projectType} onChange={(e) => setProjectType(e.target.value)} className="w-full h-12 bg-[#161616] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9674da]" disabled={projectCreationLoading || userLoading}>
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
                    
                    <div className="mb-5">
                      <label htmlFor="current-phase" className="block text-white text-lg font-medium mb-2">Current Project Phase</label>
                      <select id="current-phase" value={currentPhase} onChange={(e) => setCurrentPhase(e.target.value)} className="w-full h-12 bg-[#161616] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9674da]" disabled={projectCreationLoading || userLoading}>
                        <option value="">Select current phase</option>
                        <option value="Planning">Planning</option>
                        <option value="Development">Development</option>
                        <option value="Testing">Testing</option>
                        <option value="Launch">Launch</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Review">Review</option>
                      </select>
                    </div>
                    
                    <div className="mb-5">
                      <label htmlFor="team-size" className="block text-white text-lg font-medium mb-2">Team Size</label>
                      <input id="team-size" type="number" min="1" value={teamSize} onChange={(e) => setTeamSize(e.target.value)} className="w-full h-12 bg-[#161616] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9674da]" placeholder="Enter team size" disabled={projectCreationLoading || userLoading} />
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="complexity-level" className="block text-white text-lg font-medium mb-2">Project Complexity Level</label>
                      <select id="complexity-level" value={complexityLevel} onChange={(e) => setComplexityLevel(e.target.value)} className="w-full h-12 bg-[#161616] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9674da]" disabled={projectCreationLoading || userLoading}>
                        <option value="">Select complexity level</option>
                        <option value="Simple">Simple</option>
                        <option value="Medium">Medium</option>
                        <option value="Complex">Complex</option>
                      </select>
                    </div>
                    
                    <div className="mt-auto flex justify-between">
                      <motion.button type="button" className="text-gray-400 hover:text-white text-lg py-2 px-6 rounded-lg font-semibold" onClick={() => setStep('create')} disabled={projectCreationLoading || userLoading}>Back</motion.button>
                      <motion.button className="bg-[#9674da] text-white text-lg py-2 px-6 rounded-lg font-semibold hover:bg-[#7e5cb7] disabled:bg-gray-600 disabled:cursor-not-allowed" onClick={handleNext} disabled={!projectType || !currentPhase || !teamSize || !complexityLevel || projectCreationLoading || userLoading}>Next</motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="invite-step" variants={fieldVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col flex-grow">
                    <h2 className="text-white text-3xl font-bold mb-2">Invite Users <span className="text-lg text-gray-500">(Optional)</span></h2>
                    <p className="text-gray-400 text-base mb-6">Invite team members for "{projectName}" (Key: {userInputProjectKey}).</p>
                    <div className="mb-5 flex flex-col sm:flex-row items-end gap-2">
                      <div className="flex-grow">
                        <label htmlFor="email" className="block text-white text-lg font-medium mb-2">Enter Email Address</label>
                        <input id="email" type="email" value={email} onChange={(e) => handleEmailChange(e.target.value)} className="w-full h-12 bg-[#161616] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9674da]" placeholder="Enter an email address" disabled={projectCreationLoading || userLoading} />
                        {emailError && <motion.p className="text-red-400 text-xs mt-1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>{emailError}</motion.p>}
                      </div>
                      <motion.button className="w-full sm:w-auto bg-[#9674da] h-12 text-lg text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#7e5cb7]" onClick={handleAddEmail} disabled={!email || !!emailError || projectCreationLoading || userLoading}>+ Add</motion.button>
                    </div>
                    {invitedUsers.length > 0 && (
                      <div className="space-y-2">
                        {invitedUsers.map((u, i) => (
                          <div key={u.email} className="flex items-center gap-3 bg-[#101012] px-3 py-2 rounded-lg text-white">
                            {u.photo ? <img src={u.photo} alt={u.name || u.email} className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">{u.email[0]?.toUpperCase()}</div>}
                            <span>{u.name || u.email}</span>
                            <button className="ml-auto text-sm text-red-400 hover:text-red-200" onClick={() => setInvitedUsers(prev => prev.filter((_u, j) => j !== i))}>Remove</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-6 flex justify-between">
                      <motion.button type="button" className="text-gray-400 hover:text-white text-lg py-2 px-6 rounded-lg font-semibold" onClick={() => setStep('details')} disabled={projectCreationLoading || userLoading}>Back</motion.button>
                      <motion.button className="bg-[#9674da] text-white text-lg py-2 px-6 rounded-lg font-semibold hover:bg-[#7e5cb7]" onClick={handleCreate} disabled={projectCreationLoading || userLoading}>{projectCreationLoading || userLoading ? 'Verifying...' : 'Create Project'}</motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {popup.show && (
                  <motion.div className={`absolute bottom-4 left-6 right-6 px-4 py-2 rounded-lg shadow-lg text-white text-sm z-10 ${popup.type === 'error' ? 'bg-red-600' : popup.type === 'success' ? 'bg-green-600' : 'bg-blue-600'}`} variants={popupVariants} initial="initial" animate="animate" exit="exit" aria-live="polite">{popup.message}</motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateProjectDrawer;