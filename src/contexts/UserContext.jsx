import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback
} from 'react';
import { auth } from '../firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

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
          // Handle display name parsing more robustly
          let firstName = 'New';
          let lastName = 'User';
          
          if (fbUser.displayName) {
            const nameParts = fbUser.displayName.trim().split(' ');
            firstName = nameParts[0] || 'New';
            lastName = nameParts.slice(1).join(' ') || 'User';
          } else if (fbUser.email) {
            // Fallback to email username if no display name
            const emailUsername = fbUser.email.split('@')[0];
            firstName = emailUsername || 'New';
            lastName = 'User';
          }

          console.log('Creating user with data:', {
            id: fbUser.uid,
            email: fbUser.email,
            provider: fbUser.providerData[0]?.providerId || 'password',
            firstName,
            lastName,
            photoURL: fbUser.photoURL || null,
          });

          const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id:        fbUser.uid,
              email:     fbUser.email,
              provider:  fbUser.providerData[0]?.providerId || 'password',
              firstName,
              lastName,
              photoURL:  fbUser.photoURL || null,
            })
          });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Server returned a non-JSON error' }));
            console.error('Server error response:', { status: res.status, error: errorData });
            throw new Error(errorData.error || `Server responded with status ${res.status}`);
          }
          const profileData = await res.json();
          console.log('User created successfully:', profileData);
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

  const updateUser = async (updates = {}) => {
    if (!firebaseUser) throw new Error('No authenticated user');
    setLoading(true);
    setError('');
    try {
      const token = await firebaseUser.getIdToken();

      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `Server error: ${res.status}` }));
        throw new Error(errorData.error || `Failed to update user. Status: ${res.status}`);
      }
      
      const data = await res.json();
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
  
  // --- THIS FUNCTION IS NOW FIXED ---
  const getUserByEmail = useCallback(async (email) => {
    if (!email) {
      throw new Error("Email address is required.");
    }
    // The check for firebaseUser is essential for getting the token.
    if (!firebaseUser) {
      throw new Error("Authentication required to perform this action.");
    }

    try {
      // Get the authentication token.
      const token = await firebaseUser.getIdToken();

      const res = await fetch(`/api/users/email/${encodeURIComponent(email)}`, {
        // Add the required headers object with the token.
        headers: {
            'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `Server error: ${res.status}` }));
        throw new Error(errorData.error || 'Failed to check user existence.');
      }
      return await res.json();
    } catch (err) {
      console.error('getUserByEmail error:', err);
      throw err;
    }
  }, [firebaseUser]); // Add firebaseUser to the dependency array.

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setFirebaseUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({ firebaseUser, userData, loading, error, updateUser, updateUserError: error, getUserByEmail, logout }),
    [firebaseUser, userData, loading, error, getUserByEmail, logout]
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