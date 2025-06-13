import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { useUser } from '../../contexts/UserContext.jsx';
import ProjectHeader from './widgets/projectHeader.jsx';
import ProjectDetails from './widgets/projectDetails.jsx';

const ProjectView = () => {
  const { projectUrl } = useParams();
  const { getProjectDetails, loadingDetails, errorDetails, currentProject } = useProjects();
  // We need BOTH loading state AND the final userData object
  const { loading: userLoading, userData } = useUser(); 

  useEffect(() => {
    // --- THIS IS THE FIX ---
    // The new condition `&& userData` is the crucial part.
    // It forces this effect to wait until two things are true:
    // 1. The initial user authentication is finished (`!userLoading`).
    // 2. Your full user profile, including your database ID, has been successfully fetched (`userData`).
    // Only then do we fetch the project details. This eliminates the race condition.
    if (!userLoading && userData && projectUrl) {
      getProjectDetails(projectUrl);
    }
    // We add `userData` to the dependency array so the effect re-evaluates
    // when the user profile data finally arrives.
  }, [projectUrl, userLoading, userData, getProjectDetails]);

  // Display a generic loading message while user or project is loading
  if (userLoading || loadingDetails) {
    return (
      <div className="ml-[17rem] flex h-screen items-center justify-center bg-bg-primary">
        <p className="text-lg text-text-secondary">Loading Project...</p>
      </div>
    );
  }

  if (errorDetails) {
    return (
      <div className="ml-[17rem] flex h-screen items-center justify-center bg-bg-primary">
        <div className="text-center">
          <h2 className="text-xl font-bold text-error">Failed to Load Project</h2>
          <p className="mt-2 text-text-secondary">{errorDetails}</p>
          <Link to="/projects" className="mt-4 inline-block text-accent-primary hover:underline">
            Go back to projects
          </Link>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="ml-[17rem] flex h-screen items-center justify-center bg-bg-primary">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary">Project Not Found</h2>
          <p className="mt-2 text-text-secondary">The project may have been deleted or you may not have access.</p>
           <Link to="/projects" className="mt-4 inline-block text-accent-primary hover:underline">
            Go back to projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <ProjectHeader />
      <main className="pt-[4rem]">
        {/* ProjectDetails is now guaranteed to receive complete data */}
        <ProjectDetails />
      </main>
    </div>
  );
};

export default ProjectView;