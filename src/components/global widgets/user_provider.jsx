import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!isMounted) return;

      setLoading(true);
      setError('');

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeSnapshot = onSnapshot(
          userDocRef,
          (doc) => {
            if (doc.exists()) {
              const data = doc.data();
              setUserData({
                uid: user.uid,
                ...data,
                projects: data.projects || [],
                emailVerified: user.emailVerified,
              });
            } else {
              setUserData({ uid: user.uid, emailVerified: user.emailVerified });
            }
            setLoading(false);
          },
          (err) => {
            console.error('Error fetching user data:', err);
            setError('Failed to fetch user data');
            setUserData({ uid: user.uid, emailVerified: user.emailVerified });
            setLoading(false);
          }
        );
        return unsubscribeSnapshot;
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
    };
  }, []);

  const createUser = async (uid, userInfo) => {
    if (!uid) throw new Error('User ID is required');
    if (!userInfo.firstName || !userInfo.lastName || !userInfo.email || !userInfo.provider) {
      throw new Error('First name, last name, email, and provider are required');
    }

    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      const userData = {
        firstName: userInfo.firstName.trim(),
        lastName: userInfo.lastName.trim(),
        email: userInfo.email,
        provider: userInfo.provider,
        projects: userInfo.projects || [],
      };

      if (userDoc.exists()) {
        // Merge new data, preserving existing projects
        await setDoc(
          userDocRef,
          {
            ...userData,
            projects: userDoc.data().projects || userInfo.projects || [],
          },
          { merge: true }
        );
      } else {
        // Create new document
        await setDoc(userDocRef, userData);
      }

      // onSnapshot updates userData automatically
    } catch (err) {
      console.error('Error creating user:', err);
      throw new Error(`Failed to create user: ${err.message}`);
    }
  };

  const updateUser = async (uid, updates) => {
    if (!uid) throw new Error('User ID is required');
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, updates);
      // onSnapshot updates userData automatically
    } catch (err) {
      console.error('Error updating user:', err);
      throw new Error(`Failed to update user: ${err.message}`);
    }
  };

  const accessUser = async (uid) => {
    if (!uid) throw new Error('User ID is required');
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid,
          ...data,
          projects: data.projects || [],
          emailVerified: auth.currentUser?.emailVerified || false,
        };
      } else {
        throw new Error('User document not found');
      }
    } catch (err) {
      console.error('Error accessing user:', err);
      throw new Error(`Failed to access user: ${err.message}`);
    }
  };

  const contextValue = useMemo(
    () => ({ userData, createUser, updateUser, accessUser, loading, error }),
    [userData, loading, error]
  );

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);