import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useUser } from './UserContext.jsx';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { firebaseUser } = useUser();

  const [projects, setProjects] = useState([]);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [errorFetch, setErrorFetch] = useState(null);

  const [loadingCreate, setLoadingCreate] = useState(false);
  const [errorCreate, setErrorCreate] = useState(null);

  const [currentProject, setCurrentProject] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);

  const fetchUserProjects = useCallback(async () => {
    if (!firebaseUser) { setProjects([]); return; }
    setLoadingFetch(true); 
    setErrorFetch(null);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.statusText);
      setProjects(data);
    } catch (err) {
      setErrorFetch(err.message);
      setProjects([]);
    } finally {
      setLoadingFetch(false);
    }
  }, [firebaseUser]);

  const createProject = useCallback(async (body) => {
    if (!firebaseUser) throw new Error('Authentication required');
    setLoadingCreate(true);
    setErrorCreate(null);
    try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        fetchUserProjects(); 
        return data;
    } catch(err) {
        setErrorCreate(err.message);
        throw err;
    } finally {
        setLoadingCreate(false);
    }
  }, [firebaseUser, fetchUserProjects]);

  const getProjectDetails = useCallback(async (projectUrl) => {
    if (!firebaseUser) {
        setErrorDetails('Authentication required to fetch project details.');
        return;
    }
    setLoadingDetails(true);
    setErrorDetails(null);
    setCurrentProject(null);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/projects/${projectUrl}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch project data.');
      }
      
      setCurrentProject(data);
      return data;

    } catch (err) {
      setErrorDetails(err.message);
      setCurrentProject(null);
    } finally {
      setLoadingDetails(false);
    }
  }, [firebaseUser]);

  const deleteTask = useCallback(async (projectUrl, taskId) => {
    if (!firebaseUser) throw new Error('Authentication required');
    
    const token = await firebaseUser.getIdToken();
    const res = await fetch(`/api/projects/${projectUrl}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status === 204) {
      setCurrentProject(prev => {
        if (!prev) return null;
        return {
          ...prev,
          tasks: prev.tasks.filter(t => t.id !== taskId)
        };
      });
      return;
    }
    
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to delete task.');
  }, [firebaseUser]);

  const createTask = useCallback((newTask) => {
    setCurrentProject(prev => {
        if (!prev) return null;
        return {
            ...prev,
            tasks: [...(prev.tasks || []), newTask]
        }
    })
  }, []);

  const updateTaskInContext = useCallback((updatedTask) => {
    setCurrentProject(prev => {
        if (!prev) return null;
        const newTasks = prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
        return {
            ...prev,
            tasks: newTasks
        }
    })
  }, []);

  // NEW: Function to delete a board and its tasks from state
  const deleteBoard = useCallback(async (projectUrl, boardId) => {
    if (!firebaseUser) throw new Error("Authentication required");
    const token = await firebaseUser.getIdToken();
    const res = await fetch(`/api/projects/${projectUrl}/boards/${boardId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 204) {
        setCurrentProject(prev => {
            if (!prev) return null;
            // Filter out the board AND all tasks belonging to that board
            const newBoards = prev.boards.filter(b => b.id !== boardId);
            const newTasks = prev.tasks.filter(t => t.board_id !== boardId);
            return { ...prev, boards: newBoards, tasks: newTasks };
        });
        return;
    }
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to delete board.");
  }, [firebaseUser]);

  // NEW: Function to update a board's name
  const updateBoard = useCallback(async (projectUrl, boardId, name) => {
     if (!firebaseUser) throw new Error("Authentication required");
    const token = await firebaseUser.getIdToken();
    const res = await fetch(`/api/projects/${projectUrl}/boards/${boardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
    });
    const updatedBoard = await res.json();
    if (!res.ok) {
        throw new Error(updatedBoard.error || "Failed to update board.");
    }
    setCurrentProject(prev => {
        if (!prev) return null;
        const newBoards = prev.boards.map(b => b.id === boardId ? { ...b, ...updatedBoard } : b);
        return { ...prev, boards: newBoards };
    });
    return updatedBoard;
  }, [firebaseUser]);


  const value = useMemo(() => ({
    projects,
    loadingFetch,
    errorFetch,
    createProject,
    loadingCreate,
    errorCreate,
    currentProject,
    loadingDetails,
    errorDetails,
    fetchUserProjects,
    getProjectDetails,
    deleteTask,
    createTask,
    updateTaskInContext,
    deleteBoard,
    updateBoard,
  }), 
  [
    projects,
    loadingFetch,
    errorFetch,
    loadingCreate,
    errorCreate,
    currentProject,
    loadingDetails,
    errorDetails
  ]);

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return ctx;
};