import { createContext, useContext, useState, useCallback } from 'react';
import { db } from '../../firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, Timestamp, collection, getDocs, deleteDoc } from 'firebase/firestore';

const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const createProject = useCallback(async (projectId, projectName, userId, key) => {
    setLoading(true);
    setError('');
    try {
      console.log('Creating project:', { projectId, projectName, userId, key });

      const projectRef = doc(db, 'projects', projectId);
      await setDoc(projectRef, {
        projectId,
        projectName,
        key: key.toUpperCase(),
        users: [userId],
        createdBy: userId,
        createdAt: Timestamp.fromDate(new Date()),
        boards: ['To Do', 'In Progress', 'Done'],
      });
      console.log('Project document created:', { projectId });

      try {
        const taskId = `${key.toUpperCase()}-1`;
        const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
        await setDoc(taskRef, {
          taskId,
          taskName: 'First to do',
          notes: '',
          status: 'To Do',
          createdAt: Timestamp.fromDate(new Date()),
          createdBy: userId,
        });
        console.log('Tasks subcollection initialized with initial task:', { projectId, taskId });

        const tasksCollectionRef = collection(db, 'projects', projectId, 'tasks');
        const tasksSnapshot = await getDocs(tasksCollectionRef);
        console.log('Tasks subcollection verified:', {
          projectId,
          taskCount: tasksSnapshot.size,
          empty: tasksSnapshot.empty,
          tasks: tasksSnapshot.docs.map(doc => ({ taskId: doc.id, ...doc.data() })),
        });
      } catch (err) {
        console.error('Failed to initialize tasks subcollection:', err);
        throw new Error(`Failed to initialize tasks subcollection: ${err.message}`);
      }

      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        projects: arrayUnion(projectId),
      });
      console.log('User projects updated:', { projectId });
    } catch (err) {
      console.error('Error creating project:', err);
      setError(`Failed to create project: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (projectId) => {
    setLoading(true);
    setError('');
    try {
      console.log('Deleting project:', { projectId });

      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      if (!projectDoc.exists()) {
        console.warn('Project already deleted:', { projectId });
        return;
      }

      const projectData = projectDoc.data();
      const users = projectData.users || [];

      const tasksCollectionRef = collection(db, 'projects', projectId, 'tasks');
      const tasksSnapshot = await getDocs(tasksCollectionRef);
      const deleteTasksPromises = tasksSnapshot.docs.map((taskDoc) =>
        deleteDoc(taskDoc.ref)
      );
      await Promise.all(deleteTasksPromises);
      console.log('Tasks subcollection deleted:', { projectId });

      await deleteDoc(projectRef);
      console.log('Project document deleted:', { projectId });

      const updateUsersPromises = users.map((userId) => {
        const userDocRef = doc(db, 'users', userId);
        return updateDoc(userDocRef, {
          projects: arrayRemove(projectId),
        });
      });
      await Promise.all(updateUsersPromises);
      console.log('Removed project from users:', { projectId, users });
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(`Failed to delete project: ${err.message}`);
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
        const tasksCollectionRef = collection(db, 'projects', projectId, 'tasks');
        const tasksSnapshot = await getDocs(tasksCollectionRef);
        const tasks = tasksSnapshot.docs.map((doc) => ({
          taskId: doc.id,
          ...doc.data(),
        }));
        console.log('getProject success:', { projectId, projectName: projectData.projectName, tasks });
        return { ...projectData, tasks };
      } else {
        console.warn('getProject: Project not found', { projectId });
        return null;
      }
    } catch (err) {
      console.error('getProject error:', err);
      setError(`Failed to fetch project: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (projectId, newBoardName) => {
    setLoading(true);
    setError('');
    try {
      console.log('Updating project:', { projectId, newBoardName });

      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        boards: arrayUnion(newBoardName),
      });
      console.log('Project boards updated:', { projectId, newBoardName });
    } catch (err) {
      console.error('Error updating project:', err);
      setError(`Failed to update project: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProjectName = useCallback(async (projectId, newProjectName) => {
    setLoading(true);
    setError('');
    try {
      console.log('Updating project name:', { projectId, newProjectName });

      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }

      await updateDoc(projectRef, {
        projectName: newProjectName,
      });
      console.log('Project name updated:', { projectId, newProjectName });
    } catch (err) {
      console.error('Error updating project name:', err);
      setError(`Failed to update project name: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (projectId, taskData) => {
    setLoading(true);
    setError('');
    try {
      console.log('Creating task:', { projectId, taskData });

      const tasksCollectionRef = collection(db, 'projects', projectId, 'tasks');
      const tasksSnapshot = await getDocs(tasksCollectionRef);
      const taskCount = tasksSnapshot.size + 1;
      const taskId = `${taskData.key.toUpperCase()}-${taskCount}`;
      const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);

      const task = {
        taskId,
        taskName: taskData.taskName,
        notes: taskData.notes || '',
        status: taskData.status,
        createdAt: Timestamp.fromDate(new Date()),
        createdBy: taskData.createdBy,
      };

      await setDoc(taskRef, task);
      console.log('Task created:', { projectId, taskId });

      return task;
    } catch (err) {
      console.error('Error creating task:', err);
      setError(`Failed to create task: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (projectId, taskId, updates) => {
    setLoading(true);
    setError('');
    try {
      console.log('Updating task:', { projectId, taskId, updates });

      const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      if (!taskDoc.exists()) {
        throw new Error('Task not found');
      }

      await updateDoc(taskRef, updates);
      console.log('Task updated:', { projectId, taskId });
    } catch (err) {
      console.error('Error updating task:', err);
      setError(`Failed to update task: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <DocumentContext.Provider value={{ createProject, deleteProject, getProject, updateProject, updateProjectName, createTask, updateTask, error, loading }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => useContext(DocumentContext);