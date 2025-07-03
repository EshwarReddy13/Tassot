import { motion, AnimatePresence } from 'framer-motion';
import { useCreateProjectForm } from './hooks/useCreateProjectForm.js';
import { useCreateProjectAPI } from './hooks/useCreateProjectAPI.js';
import { useKeyboardHandlers } from './hooks/useKeyboardHandlers.js';
import { FORM_STEPS } from './utils/constants.js';
import BackgroundAnimations from './components/ui/BackgroundAnimations.jsx';
import StepHeader from './components/ui/StepHeader.jsx';
import ActionButton from './components/ui/ActionButton.jsx';
import NotificationPopup from './components/ui/NotificationPopup.jsx';

// Import step components (we'll create these next)
import CreateStep from './components/steps/CreateStep.jsx';
import DetailsStep from './components/steps/DetailsStep.jsx';
import InviteStep from './components/steps/InviteStep.jsx';

/**
 * Main Create Project Drawer Component
 * Modular implementation with extracted hooks and components
 */
const CreateProjectDrawer = ({ isOpen, onClose }) => {
  // Custom hooks for form state and API logic
  const formState = useCreateProjectForm();
  const formActions = {
    setStep: formState.setStep,
    setProjectName: formState.setProjectName,
    setDescription: formState.setDescription,
    setProjectType: formState.setProjectType,
    setCurrentPhase: formState.setCurrentPhase,
    setTeamSize: formState.setTeamSize,
    setComplexityLevel: formState.setComplexityLevel,
    handleProjectKeyChange: formState.handleProjectKeyChange,
    handleEmailChange: formState.handleEmailChange,
    addInvitedUser: formState.addInvitedUser,
    removeInvitedUser: formState.removeInvitedUser,
    showPopup: formState.showPopup,
    resetForm: formState.resetForm
  };

  const { 
    handleNext, 
    handleAddEmail, 
    handleCreate, 
    projectCreationLoading, 
    userLoading 
  } = useCreateProjectAPI(formState, formActions);

  // Handle close functionality
  const handleClose = () => {
    formState.resetForm();
    onClose();
  };

  // Keyboard handlers (ESC key)
  useKeyboardHandlers(isOpen, handleClose);

  // Handle back navigation
  const handleBack = () => {
    if (formState.step === FORM_STEPS.DETAILS) {
      formState.setStep(FORM_STEPS.CREATE);
    } else if (formState.step === FORM_STEPS.INVITE) {
      formState.setStep(FORM_STEPS.DETAILS);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (formState.step) {
      case FORM_STEPS.CREATE:
        return (
          <CreateStep
            projectName={formState.projectName}
            userInputProjectKey={formState.userInputProjectKey}
            projectKeyError={formState.projectKeyError}
            generatedDisplayId={formState.generatedDisplayId}
            onProjectNameChange={formState.setProjectName}
            onProjectKeyChange={formState.handleProjectKeyChange}
            disabled={projectCreationLoading || userLoading}
          />
        );
      case FORM_STEPS.DETAILS:
        return (
          <DetailsStep
            projectName={formState.projectName}
            description={formState.description}
            projectType={formState.projectType}
            currentPhase={formState.currentPhase}
            teamSize={formState.teamSize}
            complexityLevel={formState.complexityLevel}
            onDescriptionChange={formState.setDescription}
            onProjectTypeChange={formState.setProjectType}
            onCurrentPhaseChange={formState.setCurrentPhase}
            onTeamSizeChange={formState.setTeamSize}
            onComplexityLevelChange={formState.setComplexityLevel}
            disabled={projectCreationLoading || userLoading}
          />
        );
      case FORM_STEPS.INVITE:
        return (
          <InviteStep
            projectName={formState.projectName}
            userInputProjectKey={formState.userInputProjectKey}
            email={formState.email}
            emailError={formState.emailError}
            invitedUsers={formState.invitedUsers}
            onEmailChange={formState.handleEmailChange}
            onAddEmail={handleAddEmail}
            onRemoveUser={formState.removeInvitedUser}
            disabled={projectCreationLoading || userLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 pointer-events-none font-poppins">
          <motion.div 
            className="fixed inset-0 bg-black/30 z-40" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={handleClose} 
          />
          <motion.div 
            className="fixed inset-0 z-50 flex bg-bg-primary shadow-xl pointer-events-auto"
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }} 
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Background animations */}
            <BackgroundAnimations />

            <div className="w-full flex flex-col relative overflow-y-auto">
              {/* Header with navigation */}
              <StepHeader
                step={formState.step}
                isStep1Complete={formState.isStep1Complete}
                isStep2Complete={formState.isStep2Complete}
                progress={formState.progress}
                getProgressText={formState.getProgressText}
                onBack={handleBack}
                onClose={handleClose}
              />
              
              {/* Main content */}
              <div className="flex-1 flex">
                {/* Left side - Future content */}
                <div className="w-80 flex items-center justify-center">
                  {/* Placeholder for future left side content */}
                </div>
                
                {/* Center - Form content */}
                <div className="flex-1 max-w-4xl mx-auto px-8 py-8">
                  <AnimatePresence mode="wait">
                    {renderStepContent()}
                  </AnimatePresence>
                </div>
                
                {/* Right side - Action button */}
                <ActionButton
                  step={formState.step}
                  isStep1Complete={formState.isStep1Complete}
                  isStep2Complete={formState.isStep2Complete}
                  projectCreationLoading={projectCreationLoading}
                  userLoading={userLoading}
                  onNext={handleNext}
                  onCreate={handleCreate}
                />
              </div>
              
              {/* Popup notifications */}
              <NotificationPopup popup={formState.popup} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateProjectDrawer; 