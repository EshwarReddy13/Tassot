/**
 * Project utility functions
 */

/**
 * Generates a unique display project ID from project name
 * @param {string} projectName - The project name to generate ID from
 * @returns {string} - Generated project display ID
 */
export const generateDisplayProjectId = (projectName) => {
  if (!projectName || projectName.trim() === '') return '';
  const namePart = projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const finalNamePart = namePart || 'project';
  const randomChars = Math.random().toString(36).substring(2, 12);
  return `${finalNamePart}-${randomChars}`;
}; 