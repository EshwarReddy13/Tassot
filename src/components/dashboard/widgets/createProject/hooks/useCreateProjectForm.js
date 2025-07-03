import { useState, useEffect } from 'react';
import { validateProjectKey, validateEmail } from '../utils/validation.js';
import { generateDisplayProjectId } from '../utils/projectUtils.js';
import { FORM_STEPS, PROGRESS_MESSAGES } from '../utils/constants.js';

/**
 * Custom hook for managing create project form state and validation
 */
export const useCreateProjectForm = () => {
  // Form state
  const [step, setStep] = useState(FORM_STEPS.CREATE);
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

  // Step completion tracking
  const isStep1Complete = projectName.trim() && userInputProjectKey && !projectKeyError && generateDisplayProjectId(projectName.trim());
  const isStep2Complete = projectType && currentPhase && teamSize && complexityLevel;
  
  // Progress calculation
  const completedSteps = [
    isStep1Complete,
    isStep2Complete,
    step === FORM_STEPS.INVITE // Step 3 is considered complete when reached
  ].filter(Boolean).length;
  const progress = (completedSteps / 3) * 100;
  
  // Dynamic progress text
  const getProgressText = () => {
    return PROGRESS_MESSAGES[completedSteps] || PROGRESS_MESSAGES[3];
  };

  // Update generated display ID when project name changes
  useEffect(() => {
    setGeneratedDisplayId(generateDisplayProjectId(projectName));
  }, [projectName]);

  // Auto-hide popup after 3 seconds
  useEffect(() => {
    if (popup.show) {
      const timer = setTimeout(() => setPopup({ show: false, message: '', type: 'info' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [popup.show]);

  // Form handlers
  const handleProjectKeyChange = (value) => {
    const upperValue = value.substring(0, 4).toUpperCase();
    setUserInputProjectKey(upperValue);
    const validation = validateProjectKey(upperValue);
    setProjectKeyError(validation.error);
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    const validation = validateEmail(value);
    setEmailError(validation.error);
  };

  const addInvitedUser = (user) => {
    setInvitedUsers(prev => [...prev, user]);
  };

  const removeInvitedUser = (index) => {
    setInvitedUsers(prev => prev.filter((_, i) => i !== index));
  };

  const showPopup = (message, type = 'info') => {
    setPopup({ show: true, message, type });
  };

  const resetForm = () => {
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
    setStep(FORM_STEPS.CREATE);
    setInvitedUsers([]);
  };

  return {
    // State
    step,
    projectName,
    userInputProjectKey,
    projectKeyError,
    generatedDisplayId,
    description,
    projectType,
    currentPhase,
    teamSize,
    complexityLevel,
    email,
    emailError,
    popup,
    invitedUsers,
    
    // Computed values
    isStep1Complete,
    isStep2Complete,
    completedSteps,
    progress,
    
    // Actions
    setStep,
    setProjectName,
    setDescription,
    setProjectType,
    setCurrentPhase,
    setTeamSize,
    setComplexityLevel,
    handleProjectKeyChange,
    handleEmailChange,
    addInvitedUser,
    removeInvitedUser,
    showPopup,
    resetForm,
    getProgressText
  };
}; 