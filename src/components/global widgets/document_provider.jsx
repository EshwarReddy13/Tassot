import { createContext, useContext, useState } from 'react';
import { db } from '../../firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const createProject = async (projectId, projectName, userId) => {
    setLoading(true);
    setError('');
    try {
      await setDoc(doc(db, 'projects', projectId), {
        projectId: projectId,
        projectName: projectName,
        users: [userId],
        createdAt: Timestamp.fromDate(new Date()),
      });
    } catch (err) {
      console.error('Error creating project:', err);
      setError(`Failed to create project: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DocumentContext.Provider value={{ createProject, error, loading }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => useContext(DocumentContext);