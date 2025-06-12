import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo
} from 'react';
import { auth } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userData, setUserData]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!mounted) return;
      setLoading(true);
      setError('');
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id:        fbUser.uid,
              email:     fbUser.email,
              provider:  fbUser.providerData[0]?.providerId || 'password',
              firstName: fbUser.displayName?.split(' ')[0] || 'New',
              lastName:  fbUser.displayName?.split(' ').slice(-1)[0] || 'User'
            })
          });

          const profileData = await res.json();

          if (!res.ok) {
            throw new Error(profileData.error || 'Failed to sync user');
          }
          
          if (mounted) {
            setUserData(profileData);
          }

        } catch (err) {
          console.error('UserContext error:', err);
          if (mounted) {
            setError(err.message);
            setUserData(null);
          }
        }
      } else {
        setUserData(null);
      }

      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const updateUser = async (updates = {}) => {
    if (!firebaseUser) throw new Error('No authenticated user');
    setLoading(true);
    setError('');
    try {
      const payload = {};
      if (updates.email)     payload.email     = updates.email;
      if (updates.provider)  payload.provider  = updates.provider;
      if (updates.firstName) payload.firstName = updates.firstName;
      if (updates.lastName)  payload.lastName  = updates.lastName;

      const res = await fetch(`/api/users/${firebaseUser.uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user profile.');
      }

      setUserData(data);
      return data;

    } catch (err) {
      console.error('updateUser error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({ firebaseUser, userData, loading, error, updateUser }),
    [firebaseUser, userData, loading, error]
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
};