import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { useUser } from '../../contexts/UserContext.jsx'; // <-- Import useUser
import ProjectHeader from './widgets/projectHeader.jsx';
import ProjectDetails from './widgets/projectDetails.jsx';

const ProjectView = () => {
  const { projectUrl } = useParams();
  const { getProjectDetails, loadingDetails, errorDetails, currentProject } = useProjects();
  const { loading: userLoading } = useUser(); // <-- Get user loading state

  useEffect(() => {
    // --- THIS IS THE FIX ---
    // Do not attempt to fetch until the user is loaded AND we have a projectUrl.
    if (!userLoading && projectUrl) {
      getProjectDetails(projectUrl);
    }
    // Add userLoading to the dependency array
  }, [projectUrl, userLoading, getProjectDetails]);

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
        {/* Pass the loaded project data down to ProjectDetails */}
        <ProjectDetails />
      </main>
    </div>
  );
};

export default ProjectView;