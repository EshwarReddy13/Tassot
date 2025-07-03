import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../../../contexts/ProjectContext.jsx';
import { useUser } from '../../../../contexts/UserContext.jsx';
import { validateProjectName, validateProjectKey, validateTeamSize, isValidEmail } from '../utils/validation.js';
import { generateDisplayProjectId } from '../utils/projectUtils.js';
import { FORM_STEPS } from '../utils/constants.js';

/**
 * Custom hook for handling API calls and business logic
 */
export const useCreateProjectAPI = (formState, formActions) => {
  const navigate = useNavigate();
  const { createProject, loadingCreate: projectCreationLoading, errorCreate: projectCreationError } = useProjects();
  const { firebaseUser, getUserByEmail, loading: userLoading } = useUser();

  const { 
    step, 
    projectName, 
    userInputProjectKey, 
    projectType, 
    currentPhase, 
    teamSize, 
    complexityLevel,
    description,
    email,
    invitedUsers
  } = formState;

  const { 
    setStep, 
    showPopup, 
    addInvitedUser,
    resetForm 
  } = formActions;

  /**
   * Handles navigation to the next step with validation
   */
  const handleNext = () => {
    let canProceed = true;
    const currentGeneratedId = generateDisplayProjectId(projectName.trim());

    if (step === FORM_STEPS.CREATE) {
      // Validate step 1
      const nameValidation = validateProjectName(projectName);
      if (!nameValidation.isValid) {
        showPopup(nameValidation.error, 'error');
        canProceed = false;
      }

      const keyValidation = validateProjectKey(userInputProjectKey);
      if (!keyValidation.isValid) {
        showPopup(keyValidation.error, 'error');
        canProceed = false;
      }

      if (!currentGeneratedId && projectName.trim()) {
        showPopup('Project Display ID could not be generated.', 'error');
        canProceed = false;
      }

      if (canProceed) {
        setStep(FORM_STEPS.DETAILS);
      }
    } else if (step === FORM_STEPS.DETAILS) {
      // Validate step 2
      if (!projectType) {
        showPopup('Project Type is required.', 'error');
        canProceed = false;
      }
      if (!currentPhase) {
        showPopup('Current Project Phase is required.', 'error');
        canProceed = false;
      }
      
      const teamSizeValidation = validateTeamSize(teamSize);
      if (!teamSizeValidation.isValid) {
        showPopup(teamSizeValidation.error, 'error');
        canProceed = false;
      }
      
      if (!complexityLevel) {
        showPopup('Project Complexity Level is required.', 'error');
        canProceed = false;
      }

      if (canProceed) {
        setStep(FORM_STEPS.INVITE);
      }
    }
  };

  /**
   * Handles adding an email to the invited users list
   */
  const handleAddEmail = async () => {
    if (!email) return showPopup('Please fill in this field', 'error');
    if (!isValidEmail(email)) return showPopup('Incorrect email format', 'error');

    const lowercasedEmail = email.toLowerCase();
    const exists = invitedUsers.some(u => u.email === lowercasedEmail);
    if (exists) return showPopup('Email already added.', 'info');

    try {
      const data = await getUserByEmail(lowercasedEmail);
      const user = data.exists
        ? { email: lowercasedEmail, name: `${data.first_name} ${data.last_name}`, photo: data.photo_url }
        : { email: lowercasedEmail };

      addInvitedUser(user);
      showPopup(`Added ${lowercasedEmail}`, 'info');
    } catch (err) {
      console.error('Error checking email:', err);
      showPopup(err.message || 'Error validating email.', 'error');
    }
  };

  /**
   * Handles project creation
   */
  const handleCreate = async () => {
    // Authentication check
    if (!firebaseUser) {
      showPopup('You must be logged in to create a project', 'error');
      return;
    }

    const trimmedProjectName = projectName.trim();
    if (!trimmedProjectName) {
      showPopup('Project Name is required.', 'error');
      return;
    }

    const keyValidation = validateProjectKey(userInputProjectKey);
    if (!keyValidation.isValid) {
      showPopup('Project Key must be 4 valid uppercase letters.', 'error');
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
        showPopup('Project created successfully!', 'success');
        setTimeout(() => {
          resetForm();
          navigate(`/projects/${newProject.projectUrl}`);
        }, 1500);
      } else {
        throw new Error('Failed to get project URL after creation.');
      }
    } catch (err) {
      console.error('Error in handleCreate:', err);
      showPopup(projectCreationError || err.message || 'Failed to create project', 'error');
    }
  };

  return {
    handleNext,
    handleAddEmail,
    handleCreate,
    projectCreationLoading,
    userLoading,
    projectCreationError
  };
}; 