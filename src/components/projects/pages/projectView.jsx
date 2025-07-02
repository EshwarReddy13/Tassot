import { useEffect } from 'react';
import { useParams, Link, Outlet } from 'react-router-dom'; // <-- [NEW] Import Outlet
import { useProjects } from '../../../contexts/ProjectContext.jsx';
import { useUser } from '../../../contexts/UserContext.jsx';
import ProjectHeader from '../shared/projectHeader.jsx';
import ProjectDetails from '../shared/projectDetails.jsx';

const ProjectView = () => {
  const { projectUrl } = useParams();
  const { getProjectDetails, loadingDetails, errorDetails, currentProject } = useProjects();
  const { loading: userLoading, userData } = useUser(); 

  useEffect(() => {
    if (!userLoading && userData && projectUrl) {
      getProjectDetails(projectUrl);
    }
  }, [projectUrl, userLoading, userData, getProjectDetails]);

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
  
  // To handle the Kanban board being the "index" or default view, we determine if a child route is active.
  const location = window.location.pathname;
  const showKanbanBoard = location.endsWith(projectUrl) || location.endsWith(`${projectUrl}/`);

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <ProjectHeader />
      <main className="pt-[4rem]">
        {/* --- MODIFIED --- */}
        {/* If no sub-route is active (e.g. /users), show the kanban board */}
        {showKanbanBoard && <ProjectDetails />}
        {/* React Router will render the nested route component (ProjectUsersPage) here */}
        <Outlet />
      </main>
    </div>
  );
};

export default ProjectView;