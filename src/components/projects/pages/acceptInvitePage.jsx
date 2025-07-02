import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../../contexts/UserContext';
import { toast } from 'react-hot-toast';

// A simple loading spinner component
const Spinner = () => (
  <div className="h-8 w-8 animate-spin rounded-full border-4 border-bg-secondary border-t-accent-primary" />
);

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { firebaseUser, userData } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteDetails, setInviteDetails] = useState(null);
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided. This link is invalid.');
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/invitations/${token}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Invitation is invalid or has expired.');
        }
        setInviteDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token]);
  
  const acceptInvitation = async () => {
    setLoading(true);
    try {
        const idToken = await firebaseUser.getIdToken();
        const res = await fetch('/api/invitations/accept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}`},
            body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Could not accept invitation.');
        }
        toast.success(`Welcome to ${inviteDetails.project_name}!`);
        navigate(`/projects/${data.project_url}`);
    } catch(err) {
        toast.error(err.message);
        setLoading(false);
    }
  };

  const handleAcceptClick = () => {
    if (firebaseUser) {
      // User is already logged in, accept immediately.
      acceptInvitation();
    } else {
      // User is not logged in, store token and redirect to sign up.
      localStorage.setItem('pending_invite_token', token);
      navigate('/signup');
    }
  };
  
  const handleDeclineClick = () => {
      // User declines, just navigate them away.
      navigate('/dashboard');
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }
    if (error) {
      return (
        <>
          <h2 className="text-2xl font-bold text-error">Invitation Invalid</h2>
          <p className="mt-2 text-text-secondary">{error}</p>
          <Link to="/" className="mt-6 inline-block text-accent-primary hover:underline">Go to Homepage</Link>
        </>
      );
    }
    if (inviteDetails) {
      return (
        <>
          <h1 className="text-3xl font-bold text-text-primary">You're Invited!</h1>
          <p className="mt-4 text-lg text-text-secondary">
            <span className="font-semibold text-text-primary">{inviteDetails.inviter_name}</span> has invited you to join the project:
          </p>
          <p className="mt-2 text-2xl font-bold text-accent-primary">{inviteDetails.project_name}</p>

          {!userData && (
            <p className="mt-6 rounded-md border border-info/20 bg-info/10 p-3 text-sm text-info">
              To join, you'll be prompted to create a free Tassot account using the email <span className="font-bold">{inviteDetails.invitee_email}</span>.
            </p>
          )}

          <div className="mt-8 flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
            <button onClick={handleDeclineClick} className="w-full rounded-md bg-bg-secondary px-6 py-2.5 font-semibold text-text-primary transition-colors hover:bg-bg-card sm:w-auto">
              Decline
            </button>
            <button onClick={handleAcceptClick} className="w-full rounded-md bg-accent-primary px-6 py-2.5 font-semibold text-white transition-colors hover:bg-accent-hover sm:w-auto">
              Accept Invitation
            </button>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-lg rounded-xl bg-bg-card p-8 text-center shadow-2xl">
        {renderContent()}
      </div>
    </div>
  );
}