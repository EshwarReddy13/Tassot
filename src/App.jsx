import { useNavigate } from 'react-router-dom';
import { useUser } from './contexts/UserContext.jsx';
import { useEffect } from 'react';

const App = () => {
  const { userData, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (userData && userData.emailVerified) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [loading, userData, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1f1e25] font-poppins">
        <div
          className="w-[2.5rem] h-[2.5rem] border-[0.25rem] border-t-[#9674da] border-[#ffffff33] rounded-full animate-spin"
          role="status"
          aria-live="polite"
          aria-label="Loading"
        ></div>
      </div>
    );
  }

  return null; 
};

export default App;