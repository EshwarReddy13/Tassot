import { motion } from 'framer-motion';
import { ANIMATION_VARIANTS, PROJECT_TYPES, PROJECT_PHASES, COMPLEXITY_LEVELS } from '../../utils/constants.js';

/**
 * Step 2: Project Details - Additional project context
 */
const DetailsStep = ({
  projectName,
  description,
  projectType,
  currentPhase,
  teamSize,
  complexityLevel,
  onDescriptionChange,
  onProjectTypeChange,
  onCurrentPhaseChange,
  onTeamSizeChange,
  onComplexityLevelChange,
  disabled
}) => {
  return (
    <motion.div 
      key="details-step" 
      variants={ANIMATION_VARIANTS.fieldVariants} 
      initial="initial" 
      animate="animate" 
      exit="exit" 
      className="space-y-8"
    >
      <div className="text-center mb-10">
        <h2 className="text-text-primary text-4xl font-bold mb-3">Project Details</h2>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Provide additional context for "<span className="text-accent-primary font-semibold">{projectName}</span>" to help AI generate better tasks and recommendations.
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Project Description */}
        <div>
          <label htmlFor="project-description" className="block text-text-primary text-lg font-medium mb-2">
            Project Description <span className="text-sm text-text-secondary">(Optional)</span>
          </label>
          <textarea 
            id="project-description" 
            value={description} 
            onChange={(e) => onDescriptionChange(e.target.value)} 
            className="w-full h-32 bg-bg-secondary text-text-primary rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-accent-primary border border-border-secondary hover:border-border-primary transition-colors resize-none" 
            placeholder="Describe your project goals, objectives, and key deliverables..." 
            disabled={disabled} 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Type */}
          <div>
            <label htmlFor="project-type" className="block text-text-primary text-lg font-medium mb-2">
              Project Type
            </label>
            <select 
              id="project-type" 
              value={projectType} 
              onChange={(e) => onProjectTypeChange(e.target.value)} 
              className="w-full h-14 bg-bg-secondary text-text-primary rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-accent-primary border border-border-secondary hover:border-border-primary transition-colors" 
              disabled={disabled}
            >
              <option value="">Select project type</option>
              {PROJECT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Current Phase */}
          <div>
            <label htmlFor="current-phase" className="block text-text-primary text-lg font-medium mb-2">
              Current Project Phase
            </label>
            <select 
              id="current-phase" 
              value={currentPhase} 
              onChange={(e) => onCurrentPhaseChange(e.target.value)} 
              className="w-full h-14 bg-bg-secondary text-text-primary rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-accent-primary border border-border-secondary hover:border-border-primary transition-colors" 
              disabled={disabled}
            >
              <option value="">Select current phase</option>
              {PROJECT_PHASES.map((phase) => (
                <option key={phase.value} value={phase.value}>
                  {phase.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team Size */}
          <div>
            <label htmlFor="team-size" className="block text-text-primary text-lg font-medium mb-2">
              Team Size
            </label>
            <input 
              id="team-size" 
              type="number" 
              min="1" 
              value={teamSize} 
              onChange={(e) => onTeamSizeChange(e.target.value)} 
              className="w-full h-14 bg-bg-secondary text-text-primary rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-accent-primary border border-border-secondary hover:border-border-primary transition-colors" 
              placeholder="Enter team size" 
              disabled={disabled} 
            />
          </div>
          
          {/* Complexity Level */}
          <div>
            <label htmlFor="complexity-level" className="block text-text-primary text-lg font-medium mb-2">
              Project Complexity Level
            </label>
            <select 
              id="complexity-level" 
              value={complexityLevel} 
              onChange={(e) => onComplexityLevelChange(e.target.value)} 
              className="w-full h-14 bg-bg-secondary text-text-primary rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-accent-primary border border-border-secondary hover:border-border-primary transition-colors" 
              disabled={disabled}
            >
              <option value="">Select complexity level</option>
              {COMPLEXITY_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DetailsStep; 