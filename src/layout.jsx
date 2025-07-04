import { useEffect } from 'react';
import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useUser } from './contexts/UserContext.jsx';
import { auth } from './firebase.js';
import Navbar from './components/navbar/Navbar.jsx';

// This is a small, invisible component whose only job is to handle the
// post-login invitation flow. It lives here because Layout.jsx is inside
// the BrowserRouter and has access to navigation hooks.
const InvitationHandler = () => {
  const { userData } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const acceptPendingInvite = async () => {
      const token = localStorage.getItem('pending_invite_token');
      // Run only if a token exists and the user's data has been loaded.
      if (token && userData) {
        try {
          toast.loading('Accepting your invitation...', { id: 'invite-toast' });
          
          const idToken = await auth.currentUser.getIdToken();
          const res = await fetch('/api/invitations/accept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}`},
            body: JSON.stringify({ token }),
          });
          
          const data = await res.json();
          localStorage.removeItem('pending_invite_token');
          
          if (!res.ok) {
            throw new Error(data.error || 'Could not accept invitation.');
          }

          toast.success('Welcome to the project!', { id: 'invite-toast' });
          navigate(`/projects/${data.project_url}`);
          
        } catch (err) {
          toast.error(err.message, { id: 'invite-toast' });
        }
      }
    };
    
    acceptPendingInvite();
  }, [userData, navigate]);

  return null; // This component renders nothing.
};


// Your main Layout component
const Layout = () => {
  const location = useLocation();

  // Check if the current URL starts with /projects/ (same logic as in Navbar)
  const isProjectsRoute = location.pathname.startsWith('/projects/');

  // Calculate the navbar's width (same as in navbarVariants, including ml-2)
  const navbarWidth = isProjectsRoute ? '16.5rem' : '5rem'; // Expanded: 16.5rem, Collapsed: 5rem

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary relative">
      {/* Global Background Pattern */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        {/* Gradient circles */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
        
        {/* Additional subtle circles for more color */}
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-violet-500/15 rounded-full blur-3xl"></div>
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>
      
      <Navbar />
      <InvitationHandler />
      <div className="flex-1 h-full min-h-0 overflow-auto relative z-10" style={{ marginLeft: navbarWidth }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;