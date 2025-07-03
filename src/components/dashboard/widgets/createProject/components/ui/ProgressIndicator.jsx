import { motion } from 'framer-motion';
import { FORM_STEPS } from '../../utils/constants.js';

/**
 * Progress indicator component with step circles and progress bar
 */
const ProgressIndicator = ({ 
  step, 
  isStep1Complete, 
  isStep2Complete, 
  progress, 
  getProgressText 
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Step indicators */}
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
          step === FORM_STEPS.CREATE ? 'bg-accent-primary text-text-inverse' : 
          isStep1Complete ? 'bg-success text-text-inverse' : 'bg-bg-tertiary text-text-secondary'
        }`}>1</div>
        <div className={`w-8 h-1 rounded-full transition-colors ${
          isStep1Complete || [FORM_STEPS.DETAILS, FORM_STEPS.INVITE].includes(step) ? 'bg-accent-primary' : 'bg-bg-tertiary'
        }`}></div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
          step === FORM_STEPS.DETAILS ? 'bg-accent-primary text-text-inverse' : 
          isStep2Complete ? 'bg-success text-text-inverse' : 
          'bg-bg-tertiary text-text-secondary'
        }`}>2</div>
        <div className={`w-8 h-1 rounded-full transition-colors ${
          step === FORM_STEPS.INVITE ? 'bg-accent-primary' : 'bg-bg-tertiary'
        }`}></div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
          step === FORM_STEPS.INVITE ? 'bg-accent-primary text-text-inverse' : 'bg-bg-tertiary text-text-secondary'
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
        <p className="text-text-secondary text-sm font-medium">{getProgressText()}</p>
      </div>
    </div>
  );
};

export default ProgressIndicator; 