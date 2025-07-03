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

      <motion.button
        className={`w-full h-full bg-bg-primary flex items-center justify-center group ${
          isDisabled() ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        } relative z-10`}
        onClick={handleClick}
        disabled={isDisabled()}
      >
        <div className="flex items-center gap-4">
          <motion.span
            className={`text-text-secondary ${getHoverColor()} text-2xl font-semibold transition-colors flex items-center gap-3`}
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