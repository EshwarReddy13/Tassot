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
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      setError('');
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id:        fbUser.uid,
              email:     fbUser.email,
              provider:  fbUser.providerData[0]?.providerId || 'password',
              firstName: fbUser.displayName?.split(' ')[0] || 'New',
              lastName:  fbUser.displayName?.split(' ').slice(1).join(' ') || 'User',
              photoURL:  fbUser.photoURL || null,
            })
          });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Server returned a non-JSON error' }));
            throw new Error(errorData.error || `Server responded with status ${res.status}`);
          }
          const profileData = await res.json();
          setUserData(profileData);
        } catch (err) {
          console.error('UserContext sync error:', err);
          setError(err.message);
          setUserData(null);
        }
      } else {
        setFirebaseUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // THE FIX IS IN THIS FUNCTION
  const updateUser = async (updates = {}) => {
    if (!firebaseUser) throw new Error('No authenticated user');
    setLoading(true);
    setError('');
    try {
      // 1. Get the auth token from the currently logged-in Firebase user
      const token = await firebaseUser.getIdToken();

      const res = await fetch(`/api/users/${firebaseUser.uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // 2. Send the token in the 'Authorization' header
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      
      if (!res.ok) {
        // The backend returns a specific error message, so we parse it.
        const errorData = await res.json().catch(() => ({ error: `Server error: ${res.status}` }));
        throw new Error(errorData.error || `Failed to update user. Status: ${res.status}`);
      }
      
      const data = await res.json();
      setUserData(data);
      return data;

    } catch (err) {
      console.error('updateUser error:', err);
      setError(err.message);
      // Re-throw the error so the calling component (SettingsPage) can catch it
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({ firebaseUser, userData, loading, error, updateUser, updateUserError: error }),
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