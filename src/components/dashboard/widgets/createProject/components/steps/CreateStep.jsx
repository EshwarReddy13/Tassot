import { motion } from 'framer-motion';
import { ANIMATION_VARIANTS } from '../../utils/constants.js';

/**
 * Step 1: Create Project - Basic project information
 */
const CreateStep = ({
  projectName,
  userInputProjectKey,
  projectKeyError,
  generatedDisplayId,
  onProjectNameChange,
  onProjectKeyChange,
  disabled
}) => {
  return (
    <motion.div 
      key="create-step" 
      variants={ANIMATION_VARIANTS.fieldVariants} 
      initial="initial" 
      animate="animate" 
      exit="exit" 
      className="space-y-8"
    >
      <div className="text-center mb-10">
        <h2 className="text-text-primary text-4xl font-bold mb-3">Create Your Project</h2>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Start your collaborative journey by setting up a new project with some basic information.
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Project Name */}
        <div>
          <label htmlFor="project-name" className="block text-text-primary text-lg font-medium mb-2">
            Project Name
          </label>
          <input 
            id="project-name" 
            type="text" 
            value={projectName} 
            onChange={(e) => onProjectNameChange(e.target.value)} 
            className="w-full h-14 bg-bg-secondary text-text-primary rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-accent-primary border border-border-secondary hover:border-border-primary transition-colors" 
            placeholder="Enter your project name" 
            aria-required="true" 
            disabled={disabled} 
          />
        </div>

        {/* Project Key */}
        <div>
          <label htmlFor="project-key-input" className="block text-text-primary text-lg font-medium mb-2">
            Project Key <span className="text-xs text-text-secondary">(4 uppercase letters)</span>
          </label>
          <input 
            id="project-key-input" 
            type="text" 
            value={userInputProjectKey} 
            onChange={(e) => onProjectKeyChange(e.target.value)} 
            className={`w-full h-14 bg-bg-secondary text-text-primary rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 border transition-colors ${
              projectKeyError ? 'ring-error border-error' : 'focus:ring-accent-primary border-border-secondary hover:border-border-primary'
            }`} 
            placeholder="E.g., PROJ" 
            aria-required="true" 
            maxLength={4} 
            disabled={disabled} 
          />
          {projectKeyError && (
            <motion.p 
              className="text-error text-xs mt-1" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
            >
              {projectKeyError}
            </motion.p>
          )}
        </div>

        {/* Generated Project ID */}
        <div>
          <label className="block text-text-primary text-lg font-medium mb-2">
            Generated Project ID
          </label>
          <div className="bg-bg-card border border-border-secondary rounded-xl px-4 py-3">
            <div className="text-lg font-mono text-text-primary select-all">
              {generatedDisplayId || (
                <span className="italic text-text-secondary">Enter Project Name above</span>
              )}
            </div>
            <p className="text-sm text-text-tertiary mt-1">
              This unique identifier will be used in your project URL
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateStep; 