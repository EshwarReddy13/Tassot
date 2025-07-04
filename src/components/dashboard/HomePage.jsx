import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

import { useUser } from '../../contexts/UserContext.jsx';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { useDashboard } from '../../contexts/DashboardContext.jsx';
import CreateProjectDrawer from './widgets/HomeCreateProject.jsx';
import BackgroundImage from '../../assets/dashboard_background.png';
import Onboarding from '../onboarding/Onboarding.jsx';
import DashboardLayout from './homePage/DashboardLayout.jsx';

const DashboardPage = () => {
  const { userData, firebaseUser, loading, error } = useUser();
  const { projects, loadingFetch: loadingProjects, errorFetch: errorProjects } = useProjects();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Use dashboard context for returning users
  const dashboardData = useDashboard();

  // Debug function to test drawer opening
  const handleOpenCreateProject = () => {
    console.log('handleOpenCreateProject called from onboarding');
    console.log('Current isDrawerOpen state:', isDrawerOpen);
    setIsDrawerOpen(true);
    console.log('Set isDrawerOpen to true');
  };

  // Log state for debugging
  useEffect(() => {
    console.log('DashboardPage context state:', { userData, firebaseUser, loading, error });
    console.log('DEBUG userData:', userData);
    console.log('DEBUG projects:', projects);
    console.log('DEBUG isDrawerOpen:', isDrawerOpen);
  }, [userData, firebaseUser, loading, error, projects]);

  // Use projects array from ProjectContext for onboarding logic
  const shouldShowOnboarding = userData?.onboarding === false && !loadingProjects;

  // Debug the onboarding logic
  console.log('=== ONBOARDING DEBUG ===');
  console.log('userData?.onboarding:', userData?.onboarding);
  console.log('loadingProjects:', loadingProjects);
  console.log('shouldShowOnboarding:', shouldShowOnboarding);
  console.log('handleOpenCreateProject function exists:', typeof handleOpenCreateProject === 'function');
  console.log('========================');

  if (loading || loadingProjects) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary font-poppins">
        <div
          className="w-[2.5rem] h-[2.5rem] border-[0.25rem] border-t-accent border-border-secondary rounded-full animate-spin"
          role="status"
          aria-live="polite"
          aria-label="Loading dashboard"
        ></div>
      </div>
    );
  }

  // If there's no firebaseUser, the user is not authenticated with Firebase.
  if (!firebaseUser) {
    console.log('Redirecting to /login: No Firebase user session.');
    navigate('/login', { replace: true });
    return null;
  }

  // If firebaseUser exists, then check for email verification.
  if (!firebaseUser.emailVerified) {
    console.log('Redirecting to /verify-email: Email not verified on firebaseUser.');
    navigate('/verify-email', { replace: true });
    return null;
  }

  // After confirming Firebase auth and email verification, check if userData (from PSQL) exists.
  if (!userData && !loading && !error) {
    console.log('DashboardPage: firebaseUser exists, email verified, but no userData from backend and no explicit error/loading. This could be a sync issue.');
  }

  return (
    <>
      {shouldShowOnboarding ? (
        console.log('Rendering Onboarding component with function:', handleOpenCreateProject) ||
        <Onboarding userData={userData} onOpenCreateProject={handleOpenCreateProject} />
      ) : (
        // Show new dashboard layout for returning users
        <DashboardLayout
          userData={userData}
          projects={projects}
          tasks={dashboardData.tasks}
          activities={dashboardData.activities}
          dashboardStats={dashboardData.dashboardStats}
          onCreateProject={() => setIsDrawerOpen(true)}
        />
      )}
      <CreateProjectDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
};

export default DashboardPage;