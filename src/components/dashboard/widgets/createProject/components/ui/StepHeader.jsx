import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { FORM_STEPS } from '../../utils/constants.js';
import ProgressIndicator from './ProgressIndicator.jsx';

/**
 * Step header component with navigation and progress indicator
 */
const StepHeader = ({ 
  step, 
  isStep1Complete, 
  isStep2Complete, 
  progress, 
  getProgressText, 
  onBack, 
  onClose 
}) => {
  return (
    <div className="sticky top-0 bg-bg-primary z-10 border-b border-border-primary">
      <div className="max-w-4xl mx-auto px-8 py-6 flex items-center justify-between">
        {step === FORM_STEPS.CREATE ? (
          <button 
            className="text-text-secondary hover:text-text-primary text-2xl font-light" 
            onClick={onClose} 
            aria-label="Close"
          >
            ×
          </button>
        ) : (
          <button 
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors" 
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        )}
        
        {/* Step indicator */}
        <ProgressIndicator
          step={step}
          isStep1Complete={isStep1Complete}
          isStep2Complete={isStep2Complete}
          progress={progress}
          getProgressText={getProgressText}
        />
        
        <button 
          className="text-text-secondary hover:text-text-primary text-2xl font-light" 
          onClick={onClose} 
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default StepHeader; 