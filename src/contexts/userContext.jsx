// src/contexts/UserContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo
} from 'react';
import { auth } from '../firebase';               // your firebase init
import { onAuthStateChanged } from 'firebase/auth';

const UserContext = createContext();

/**
 * UserProvider
 * • Listens to Firebase Auth state
 * • Ensures a corresponding Postgres user exists via /api/createUser
 * • Fetches the full user profile via GET /api/users/:uid
 * • Exposes firebaseUser, userData, loading, error, and updateUser()
 */
export function UserProvider({ children }) {
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
          // 1) Ensure user exists (POST /api/createUser)
          const createRes = await fetch('/api/createUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id:        fbUser.uid,
              email:     fbUser.email,
              provider:  fbUser.providerData[0]?.providerId || '',
              firstName: fbUser.displayName?.split(' ')[0] || '',
              lastName:  fbUser.displayName?.split(' ').slice(-1)[0] || ''
            })
          });

          if (createRes.status !== 201 && createRes.status !== 409) {
            // 409 means "already exists", which is fine
            const errJson = await createRes.json().catch(() => ({}));
            throw new Error(errJson.error || 'Failed to create user');
          }

          // 2) Fetch full profile (GET /api/users/:uid)
          const getRes = await fetch(`/api/users/${fbUser.uid}`);
          if (!getRes.ok) {
            throw new Error('Failed to fetch user profile');
          }
          const profile = await getRes.json();
          if (mounted) setUserData(profile);
        } catch (err) {
          console.error(err);
          if (mounted) {
            setError(err.message);
            setUserData(null);
          }
        }
      } else {
        // signed out
        setUserData(null);
      }

      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  /**
   * updateUser(updates)
   * • PATCH /api/users/:uid with any of { email, provider, firstName, lastName }
   * • Returns the updated profile
   */
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
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to update user');
      }
      const updated = await res.json();
      setUserData(updated);
      return updated;
    } catch (err) {
      console.error(err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const contextValue = useMemo(
    () => ({ firebaseUser, userData, loading, error, updateUser }),
    [firebaseUser, userData, loading, error]
  );

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

/** useUser — hook for consuming the user context */
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return ctx;
}