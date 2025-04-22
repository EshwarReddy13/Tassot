import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!isMounted) return;

        try {
          if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const data = userDoc.data();
              if (!data.firstName || !data.lastName || !data.email || !data.provider) {
                throw new Error('Incomplete user data in Firestore');
              }
              setUserData({ uid: user.uid, ...data, emailVerified: user.emailVerified });
            } else {
              throw new Error('User document not found in Firestore');
            }
          } else {
            setUserData(null);
          }
        } catch (err) {
          console.error('UserProvider error:', err);
          setError(`Failed to load user data: ${err.message}`);
          setUserData(null);
        } finally {
          if (isMounted) setLoading(false);
        }
      },
      (err) => {
        console.error('Auth state error:', err);
        setError(`Authentication error: ${err.message}`);
        if (isMounted) setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ userData, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);