// src/pages/ProjectsPage.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react'; // Removed useState, useRef as state comes from context now
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/userContext.jsx'; // Adjust path as needed
// REMOVE: Old document provider and Firestore imports
// import { useDocuments } from '../global widgets/documentProvider.jsx';
// import { doc, getDoc } from 'firebase/firestore';
// import { db } from '../../firebase.js';
// ADD: Import useProjects hook
import { useProjects } from '../../contexts/projectContext.jsx'; // Adjust path as needed

const ProjectsPage = () => {
  const navigate = useNavigate();
  // Get user state
  const { firebaseUser, loading: userLoading, error: userError } = useUser();
  // Get project state and fetch function from ProjectContext
  const {
    projects,         // Array of projects from context state
    fetchUserProjects, // Function to fetch projects
    loadingFetch: projectsLoading, // Loading state for project fetch
    errorFetch: projectsError,     // Error state for project fetch
  } = useProjects();

  // Effect to fetch projects when user is available
  useEffect(() => {
    // Check if user is authenticated before fetching
    if (firebaseUser) {
      console.log('ProjectsPage: User found, calling fetchUserProjects.');
      fetchUserProjects();
    } else if (!userLoading) {
      // If not loading and no firebaseUser, likely logged out.
      // ProjectContext might clear projects, or handle internally.
      console.log('ProjectsPage: No user, skipping project fetch.');
    }
    // Dependency array: Fetch when the function reference changes or user logs in/out
  }, [firebaseUser, fetchUserProjects, userLoading]); // Added userLoading to prevent fetch before user state is determined


  const handleProjectClick = (projectKey) => {
    // Navigate using the projectKey (or ID if your routes use that)
    navigate(`/projects/${projectKey}`);
  };

  // Card animation variants (kept from original)
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  // Determine overall loading state
  const isLoading = userLoading || projectsLoading;
  // Combine potential errors (optional: prioritize or format)
  const displayError = userError || projectsError;

  return (
    <div className="min-h-screen bg-[#292830]">
      <main
        className="ml-0 md:ml-[4rem] mr-4 pt-6 pb-4 px-4 sm:px-6 min-h-[calc(100vh)]" // Adjusted margin/padding
        aria-label="Projects list"
      >
        <motion.h1
          className="text-2xl sm:text-3xl font-bold text-white mb-6" // Adjusted size
          style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Your Projects
        </motion.h1>

        {/* Display combined loading state */}
        {isLoading && (
          <motion.div // Changed to div for centering
            className="flex justify-center items-center py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
             <div
                className="w-8 h-8 border-4 border-t-[#9674da] border-[#ffffff33] rounded-full animate-spin"
                role="status"
                aria-live="polite"
                aria-label="Loading projects"
             ></div>
             <span className="ml-3 text-white">Loading projects...</span>
          </motion.div>
        )}

        {/* Display combined error messages */}
        {displayError && !isLoading && ( // Only show error if not loading
          <motion.p
            className="text-red-400 text-sm mb-4 text-center p-4 bg-red-900/20 rounded" // Added background
            initial={{ opacity: 0, y: -10 }} // Changed animation direction
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            role="alert"
          >
            Error loading data: {displayError}
          </motion.p>
        )}

        {/* Display 'No Projects' message */}
        {!isLoading && !displayError && projects.length === 0 && (
          <motion.p
            className="text-gray-400 text-lg text-center py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            You are not part of any projects yet.{' '}
            <button
              className="text-[#9674da] hover:underline focus:outline-none font-semibold" // Added focus style
              onClick={() => navigate('/dashboard')} // Link back to dashboard where create button is
              aria-label="Go to dashboard to create a project"
            >
              Create a project
            </button>
            .
          </motion.p>
        )}

        {/* Display Project Grid */}
        <AnimatePresence>
          {!isLoading && !displayError && projects.length > 0 && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" // Added xl column
              initial={{ opacity: 0 }} // Optional: Animate grid appearance
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {projects.map((project, index) => (
                <motion.div
                  // Use project.id (UUID) or project.projectKey as key
                  key={project.id || project.projectKey}
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ delay: index * 0.05 }} // Faster stagger
                  className="bg-[#17171b] rounded-lg p-4 hover:bg-[#2a2933] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9674da]" // Improved hover/focus
                  onClick={() => handleProjectClick(project.projectKey)} // Navigate using projectKey
                  role="button"
                  tabIndex={0} // Make it focusable
                  aria-label={`View project ${project.projectName}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleProjectClick(project.projectKey); // Navigate using projectKey
                    }
                  }}
                >
                  {/* Ensure project object has these fields from your API */}
                  <h2 className="text-white text-lg sm:text-xl font-semibold mb-2 truncate" title={project.projectName}>
                    {project.projectName || 'Unnamed Project'}
                  </h2>
                  <p className="text-gray-400 text-xs sm:text-sm mb-2 font-mono" title={project.projectKey}>
                    Key: {project.projectKey || 'N/A'}
                  </p>
                  {/* Format date correctly from ISO string */}
                  {project.createdAt && (
                     <p className="text-gray-500 text-xs sm:text-sm">
                       Created: {new Date(project.createdAt).toLocaleDateString()}
                     </p>
                  )}
                  {/* You might want to add more project info here later */}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ProjectsPage;