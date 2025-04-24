import { createContext, useContext, useState, useCallback } from 'react';
import { db } from '../../firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, Timestamp, collection, getDocs } from 'firebase/firestore';

const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const createProject = useCallback(async (projectId, projectName, userId) => {
    setLoading(true);
    setError('');
    try {
      console.log('Creating project:', { projectId, projectName, userId });
      await setDoc(doc(db, 'projects', projectId), {
        projectId,
        projectName,
        users: [userId],
        createdBy: userId,
        createdAt: Timestamp.fromDate(new Date()),
        boards: ['To Do', 'In Progress', 'Done'], // Default boards
      });

      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        projects: arrayUnion(projectId),
      });
      console.log('Project created and user updated:', { projectId });
    } catch (err) {
      console.error('Error creating project:', err);
      setError(`Failed to create project: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProject = useCallback(async (projectId) => {
    console.log('getProject called:', { projectId });
    setLoading(true);
    setError('');
    try {
      const projectDocRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectDocRef);
      if (projectDoc.exists()) {
        const projectData = projectDoc.data();
        // Fetch tasks from subcollection
        const tasksCollectionRef = collection(db, 'projects', projectId, 'tasks');
        const tasksSnapshot = await getDocs(tasksCollectionRef);
        const tasks = tasksSnapshot.docs.map((doc) => ({
          taskId: doc.id,
          ...doc.data(),
        }));
        console.log('getProject success:', { projectData, tasks });
        return { ...projectData, tasks };
      } else {
        console.error('getProject failed: Project not found', { projectId });
        throw new Error('Project not found');
      }
    } catch (err) {
      console.error('getProject error:', err);
      setError(`Failed to fetch project: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <DocumentContext.Provider value={{ createProject, getProject, error, loading }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => useContext(DocumentContext);