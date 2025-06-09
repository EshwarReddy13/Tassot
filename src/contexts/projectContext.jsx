import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useUser } from './UserContext.jsx';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { firebaseUser } = useUser();

  const [projects, setProjects]           = useState([]);
  const [loadingFetch, setLoadingFetch]   = useState(false);
  const [errorFetch, setErrorFetch]       = useState(null);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [errorCreate, setErrorCreate]     = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails]     = useState(null);

  const createProject = useCallback(async (body) => {
    if (!firebaseUser) throw new Error('Authentication required');
    setLoadingCreate(true); setErrorCreate(null);
    const token = await firebaseUser.getIdToken();
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.statusText);
    setLoadingCreate(false);
    return data;
  }, [firebaseUser]);

  const fetchUserProjects = useCallback(async () => {
    if (!firebaseUser) { setProjects([]); return; }
    setLoadingFetch(true); setErrorFetch(null);
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

  const getProjectDetails = useCallback(async (projectUrl) => {
    if (!firebaseUser) throw new Error('Authentication required');
    setLoadingDetails(true); setErrorDetails(null);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/projects/${projectUrl}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // **FIXED LOGIC ORDER**
      // First, check if the response was successful.
      if (!res.ok) {
        // Try to parse error JSON, but fall back to status text if it fails.
        let errorData;
        try {
          errorData = await res.json();
        } catch (e) {
          throw new Error(res.statusText);
        }
        throw new Error(errorData.error || res.statusText);
      }
      
      // Only parse as JSON if the response is OK.
      const data = await res.json();
      return data;

    } catch (err) {
      setErrorDetails(err.message);
      throw err;
    } finally {
      setLoadingDetails(false);
    }
  }, [firebaseUser]);

  const value = useMemo(() => ({
    projects, loadingFetch, errorFetch,
    createProject, loadingCreate, errorCreate,
    fetchUserProjects,
    getProjectDetails, loadingDetails, errorDetails
  }), [
    projects, loadingFetch, errorFetch,
    createProject, loadingCreate, errorCreate,
    fetchUserProjects,
    getProjectDetails, loadingDetails, errorDetails
  ]);

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
};