import { useParams } from 'react-router-dom';
import { useUser } from '../global widgets/user_provider.jsx';
import ProjectNavbar from './widgets/project_navbar.jsx';
import ProjectHeader from './widgets/project_header.jsx';
import ProjectDetails from './widgets/project_details.jsx';

const ProjectView = () => {
  const { projectId } = useParams();
  const { userData, loading: userLoading } = useUser();

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#1f1e25] flex items-center justify-center">
        <p className="text-white text-center">Loading...</p>
      </div>
    );
  }

  if (!userData?.uid) {
    return (
      <div className="min-h-screen bg-[#1f1e25] flex items-center justify-center">
        <p className="text-red-400 text-center">User not authenticated</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1f1e25]">
      <ProjectNavbar />
      <ProjectHeader projectId={projectId} />
      <ProjectDetails />
    </div>
  );
};

export default ProjectView;