/**
 * Constants and configuration for project creation
 */

/**
 * Project type options for the form
 */
export const PROJECT_TYPES = [
  { value: 'Software Development', label: 'Software Development' },
  { value: 'Marketing Campaign', label: 'Marketing Campaign' },
  { value: 'Event Planning', label: 'Event Planning' },
  { value: 'Product Launch', label: 'Product Launch' },
  { value: 'Research Project', label: 'Research Project' },
  { value: 'Content Creation', label: 'Content Creation' },
  { value: 'Design Project', label: 'Design Project' },
  { value: 'Business Strategy', label: 'Business Strategy' },
  { value: 'Other', label: 'Other' }
];

/**
 * Project phase options for the form
 */
export const PROJECT_PHASES = [
  { value: 'Planning', label: 'Planning' },
  { value: 'Development', label: 'Development' },
  { value: 'Testing', label: 'Testing' },
  { value: 'Launch', label: 'Launch' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Review', label: 'Review' }
];

/**
 * Complexity level options for the form
 */
export const COMPLEXITY_LEVELS = [
  { value: 'Simple', label: 'Simple' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Complex', label: 'Complex' }
];

/**
 * Form step configuration
 */
export const FORM_STEPS = {
  CREATE: 'create',
  DETAILS: 'details',
  INVITE: 'invite'
};

/**
 * Progress text messages
 */
export const PROGRESS_MESSAGES = {
  0: "Let's start with the basics",
  1: "Great! Now add some details", 
  2: "Almost done! Invite your team",
  3: "Ready to create your project!"
};

/**
 * Animation variants for framer motion
 */
export const ANIMATION_VARIANTS = {
  fieldVariants: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  },
  popupVariants: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  }
}; 