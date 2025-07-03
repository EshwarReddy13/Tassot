/**
 * Validation utilities for project creation form
 */

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email is valid
 */
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Validates project key format (4 uppercase letters)
 * @param {string} key - Project key to validate
 * @returns {boolean} - True if key is valid format
 */
export const isValidProjectKeyFormat = (key) => /^[A-Z]{4}$/.test(key);

/**
 * Validates project name
 * @param {string} name - Project name to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateProjectName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Project Name is required.' };
  }
  return { isValid: true, error: '' };
};

/**
 * Validates project key input
 * @param {string} key - Project key to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateProjectKey = (key) => {
  if (!key) {
    return { isValid: false, error: 'Please fill in this field.' };
  }
  if (!isValidProjectKeyFormat(key)) {
    return { isValid: false, error: 'Must be 4 uppercase letters.' };
  }
  return { isValid: true, error: '' };
};

/**
 * Validates email input
 * @param {string} email - Email to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: 'Please fill in this field' };
  }
  if (!isValidEmail(email)) {
    return { isValid: false, error: 'Incorrect email format' };
  }
  return { isValid: true, error: '' };
};

/**
 * Validates team size
 * @param {string|number} size - Team size to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateTeamSize = (size) => {
  if (!size || size < 1) {
    return { isValid: false, error: 'Team Size must be at least 1.' };
  }
  return { isValid: true, error: '' };
}; 