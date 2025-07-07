import { useEffect } from 'react';
import { useParams, Link, Outlet, useLocation } from 'react-router-dom';
import { useProjects } from '../../../contexts/ProjectContext.jsx';
import { useUser } from '../../../contexts/UserContext.jsx';
import ProjectHeader from './ProjectHeader.jsx';
import BoardTabs from '../board/BoardTabs.jsx';
import BoardDetails from '../board/BoardDetails.jsx';
import TimelineView from '../board/TimelineView.jsx';
import ListView from '../board/ListView.jsx';
import AllWorkView from '../board/AllWorkView.jsx';

const ProjectView = () => {
  const { projectUrl } = useParams();
  const location = useLocation();
  const { getProjectDetails, loadingDetails, errorDetails, currentProject } = useProjects();
  const { loading: userLoading, userData } = useUser(); 

  useEffect(() => {
    if (!userLoading && userData && projectUrl) {
      getProjectDetails(projectUrl);
    }
  }, [projectUrl, userLoading, userData, getProjectDetails]);

  if (userLoading || loadingDetails) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-text-secondary">Loading Project...</p>
      </div>
    );
  }

  if (errorDetails) {
    return (
      <div className="flex h-screen items-center justify-center">
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
      <div className="flex h-screen items-center justify-center">
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
  
  // Check if we're on a board-related route (kanban, timeline, list, all-work)
  const isBoardRoute = () => {
    const path = location.pathname;
    const boardRoutes = ['timeline', 'list', 'all-work'];
    return path.endsWith(projectUrl) || 
           path.endsWith(`${projectUrl}/`) || 
           boardRoutes.some(route => path.includes(`/${route}`));
  };

  // Render board content based on current route
  const renderBoardContent = () => {
    const path = location.pathname;
    
    if (path.includes('/timeline')) {
      return <TimelineView />;
    } else if (path.includes('/list')) {
      return <ListView />;
    } else if (path.includes('/all-work')) {
      return <AllWorkView />;
    } else {
      // Default to kanban board
      return <BoardDetails />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ProjectHeader />
      <main>
        {isBoardRoute() ? (
          <div className="min-h-screen">
            <BoardTabs />
            <div className="bg-gradient-to-b from-bg-primary/30 to-bg-primary/10">
              {renderBoardContent()}
            </div>
          </div>
        ) : (
          // For non-board routes (users, dashboard, settings), render the Outlet
          <div className="pt-[4rem]">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectView;