import { useEffect } from 'react';
import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useUser } from './contexts/UserContext.jsx';
import { auth } from './firebase.js';
import Navbar from './components/global widgets/navbar.jsx';

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
  const marginLeft = `calc(${navbarWidth})`;

  return (
    <div className="flex h-screen">
      <Navbar />
      <InvitationHandler /> {/* The handler is now safely inside the Router context */}
      <div
        className="flex-1 h-full overflow-auto"
        style={{ marginLeft }} // Dynamically set margin-left based on navbar width
      >
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;