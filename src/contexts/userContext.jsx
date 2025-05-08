// src/contexts/userContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback
} from 'react';
import { auth } from '../firebase.js'; // Adjust path to your firebase initialization
import { onAuthStateChanged } from 'firebase/auth';

const UserContext = createContext();

/**
 * UserProvider
 * • Listens to Firebase Auth state
 * • Ensures a corresponding Postgres user exists via /api/users/createUser
 * • Fetches the full user profile via GET /api/users/:uid
 * • Exposes firebaseUser, userData, loading state, specific error states,
 * a general error state, and the updateUser() function.
 */
export const UserProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [createUserError, setCreateUserError] = useState(null);
  const [getUserError, setGetUserError] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);

  // Function to create the user in your PostgreSQL database
  const createUserInDB = useCallback(async (fbUser) => {
    setCreateUserError(null);
    try {
      const response = await fetch('/api/users/createUser', { // Updated path
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: fbUser.uid, // This will be used as firebase_uid in your backend
          email: fbUser.email,
          provider: fbUser.providerData?.[0]?.providerId || 'email',
          firstName: fbUser.displayName?.split(' ')[0] || '',
          lastName: fbUser.displayName?.split(' ').slice(1).join(' ') || '',
          photo_url: fbUser.photoURL || '',
        }),
      });

      if (response.status !== 201 && response.status !== 409) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create user and parse error JSON' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      // For 201 (Created) or 409 (Conflict - user already exists), operation is considered fine.
      // We will fetch the user profile next anyway.
      return response.status;
    } catch (err) {
      console.error('Error in createUserInDB:', err);
      setCreateUserError(err.message);
      throw err;
    }
  }, []);

  // Function to fetch the user profile from your PostgreSQL database
  const fetchUserProfile = useCallback(async (uid) => {
    setGetUserError(null);
    try {
      const response = await fetch(`/api/users/${uid}`); // Path for specific user remains /api/users/:uid
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch user profile and parse error JSON' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      const profile = await response.json();
      if (profile) {
        setUserData(profile);
      } else {
        // This case might indicate an issue if a Firebase user exists but no DB record was found/created
        throw new Error('User profile not found in database after sign-in.');
      }
      return profile;
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      setGetUserError(err.message);
      setUserData(null);
      throw err;
    }
  }, []);

  // Effect to handle Firebase auth state changes
  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!mounted) return;

      setLoading(true);
      setCreateUserError(null);
      setGetUserError(null);
      setUpdateUserError(null);
      setError(null);

      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          await createUserInDB(fbUser);
          await fetchUserProfile(fbUser.uid);
        } catch (err) {
          console.error('Error during user sync after auth state change:', err);
          if (mounted) {
            setError(err.message || 'Failed to synchronize user data with backend.');
            setUserData(null);
          }
        }
      } else {
        setUserData(null);
      }
      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [createUserInDB, fetchUserProfile]);

  /**
   * updateUser(updates)
   * • POST /api/users/updateUser/:uid with payload
   * • Updates `userData` in context with the returned profile.
   */
  const updateUser = useCallback(async (updates = {}) => {
    if (!firebaseUser) {
      const noUserError = new Error('No authenticated user to update.');
      setUpdateUserError(noUserError.message);
      throw noUserError;
    }

    setLoading(true);
    setUpdateUserError(null);
    setError(null);

    try {
      const payload = { ...updates };
      const response = await fetch(`/api/users/updateUser/${firebaseUser.uid}`, { // Updated path and method
        method: 'POST', // Changed from PATCH
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update user and parse error JSON' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      const updatedProfile = await response.json();
      setUserData(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Error in updateUser:', err);
      setUpdateUserError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  const contextValue = useMemo(() => ({
    firebaseUser,
    userData,
    loading,
    error,
    createUserError,
    getUserError,
    updateUserError,
    updateUser,
  }), [
    firebaseUser,
    userData,
    loading,
    error,
    createUserError,
    getUserError,
    updateUserError,
    updateUser
  ]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};