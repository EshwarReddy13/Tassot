import { motion } from 'framer-motion';
import { FORM_STEPS } from '../../utils/constants.js';

/**
 * Action button component with glowing animations
 */
const ActionButton = ({ 
  step, 
  isStep1Complete, 
  isStep2Complete, 
  projectCreationLoading, 
  userLoading, 
  onNext, 
  onCreate 
}) => {
  const getButtonText = () => {
    switch (step) {
      case FORM_STEPS.CREATE:
        return 'Continue to Details';
      case FORM_STEPS.DETAILS:
        return 'Continue to Invitations';
      case FORM_STEPS.INVITE:
        return projectCreationLoading || userLoading ? 'Creating Project...' : 'Create Project';
      default:
        return 'Continue';
    }
  };

  const getButtonIcon = () => {
    switch (step) {
      case FORM_STEPS.CREATE:
      case FORM_STEPS.DETAILS:
        return '→';
      case FORM_STEPS.INVITE:
        return '✨';
      default:
        return '→';
    }
  };

  const isDisabled = () => {
    switch (step) {
      case FORM_STEPS.CREATE:
        return !isStep1Complete || projectCreationLoading || userLoading;
      case FORM_STEPS.DETAILS:
        return !isStep2Complete || projectCreationLoading || userLoading;
      case FORM_STEPS.INVITE:
        return projectCreationLoading || userLoading;
      default:
        return false;
    }
  };

  const getHoverColor = () => {
    return step === FORM_STEPS.INVITE ? 'group-hover:text-success' : 'group-hover:text-accent-primary';
  };

  const handleClick = () => {
    if (step === FORM_STEPS.INVITE) {
      onCreate();
    } else {
      onNext();
    }
  };

  return (
    <div className="w-80 flex items-center justify-center relative">
      {/* Enhanced glowing accent animation spanning full height */}
      <motion.div
        className="absolute -right-6 top-0 bottom-0 w-12 rounded-l-2xl"
        animate={{ 
          boxShadow: [
            '0 0 0 0 rgba(167, 139, 250, 0)',
            '-15px 0 40px 8px rgba(167, 139, 250, 0.6)',
            '-25px 0 60px 15px rgba(167, 139, 250, 0.5)',
            '-15px 0 40px 8px rgba(167, 139, 250, 0.6)',
            '0 0 0 0 rgba(167, 139, 250, 0)'
          ],
          background: [
            'rgba(167, 139, 250, 0)',
            'rgba(167, 139, 250, 0.2)',
            'rgba(167, 139, 250, 0.3)',
            'rgba(167, 139, 250, 0.2)',
            'rgba(167, 139, 250, 0)'
          ]
        }}
        transition={{ 
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Enhanced pulse spanning full height */}
      <motion.div
        className="absolute -right-3 top-0 bottom-0 w-6 bg-accent-primary/20 rounded-l-xl"
        animate={{ 
          opacity: [0, 0.7, 0],
          scaleY: [0.8, 1.2, 0.8],
          scaleX: [0.6, 1.1, 0.6]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3
        }}
      />

      {/* Additional prominent pulsing element spanning full height */}
      <motion.div
        className="absolute -right-4 top-0 bottom-0 w-8 bg-accent-primary/15 rounded-l-xl"
        animate={{ 
          opacity: [0, 0.8, 0],
          scaleY: [0.7, 1.3, 0.7],
          scaleX: [0.4, 1.2, 0.4]
        }}
        transition={{ 
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8
        }}
      />

      <motion.button
        className={`w-full h-full bg-bg-primary flex items-center justify-center group ${
          isDisabled() ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        } relative z-10`}
        onClick={handleClick}
        disabled={isDisabled()}
      >
        <div className="flex items-center gap-4">
          <motion.span
            className={`text-text-secondary ${getHoverColor()} text-3xl font-semibold transition-colors flex items-center gap-3`}
            whileHover={{ scale: 1.1 }}
          >
            {step === FORM_STEPS.INVITE && (projectCreationLoading || userLoading) ? (
              <>
                <div className="w-6 h-6 border-2 border-text-secondary/30 border-t-text-secondary rounded-full animate-spin"></div>
                {getButtonText()}
              </>
            ) : (
              getButtonText()
            )}
          </motion.span>
          {!(step === FORM_STEPS.INVITE && (projectCreationLoading || userLoading)) && (
            <motion.div
              className={`text-text-secondary ${getHoverColor()} text-2xl transition-colors`}
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
              {getButtonIcon()}
            </motion.div>
          )}
        </div>
      </motion.button>
    </div>
  );
};

export default ActionButton; 