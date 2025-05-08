// src/contexts/projectContext.jsx
import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo
  } from 'react';
  import { useUser } from './userContext'; // To potentially get owner info if needed, though backend should use auth token
  
  const ProjectContext = createContext();
  
  export const ProjectProvider = ({ children }) => {
    const { firebaseUser } = useUser(); // Get firebaseUser to check authentication status
    const [projects, setProjects] = useState([]); // List of user's projects
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [errorCreate, setErrorCreate] = useState(null);
    const [loadingFetch, setLoadingFetch] = useState(false);
    const [errorFetch, setErrorFetch] = useState(null);
  
    // Function to create a project
    const createProject = useCallback(async ({ projectName, projectKey }) => {
      // Check if user is authenticated via Firebase first
      if (!firebaseUser) {
        throw new Error("Authentication required to create a project.");
      }
  
      setLoadingCreate(true);
      setErrorCreate(null);
  
      try {
        // Get Firebase token to send to backend for authentication
        const token = await firebaseUser.getIdToken();
  
        const response = await fetch('/api/projects', { // Using POST /api/projects
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Send token for backend authentication
          },
          body: JSON.stringify({ projectName, projectKey }),
        });
  
        const responseData = await response.json();
  
        if (!response.ok) {
          throw new Error(responseData.error || `Server error: ${response.status}`);
        }
  
        // Optionally: Add the new project to the local state or trigger a refetch
        // setProjects(prevProjects => [...prevProjects, responseData]);
        // Or call fetchUserProjects();
  
        return responseData; // Return the newly created project data
  
      } catch (err) {
        console.error("Error creating project in ProjectContext:", err);
        setErrorCreate(err.message);
        throw err; // Re-throw for the component to handle if needed
      } finally {
        setLoadingCreate(false);
      }
    }, [firebaseUser]); // Depend on firebaseUser to get token
  
    // Function to fetch projects for the current user (example)
    const fetchUserProjects = useCallback(async () => {
      if (!firebaseUser) {
        // Don't fetch if not logged in, maybe clear projects
        setProjects([]);
        return;
      }
  
      setLoadingFetch(true);
      setErrorFetch(null);
      try {
        const token = await firebaseUser.getIdToken();
        const response = await fetch('/api/projects', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }
        const data = await response.json();
        setProjects(data || []);
      } catch (err) {
        console.error("Error fetching user projects:", err);
        setErrorFetch(err.message);
        setProjects([]); // Clear projects on error
      } finally {
        setLoadingFetch(false);
      }
    }, [firebaseUser]);
  
  
    // Context value
    const contextValue = useMemo(() => ({
      projects,
      loadingCreate,
      errorCreate,
      loadingFetch,
      errorFetch,
      createProject,
      fetchUserProjects,
      // Add other project-related functions here (fetchProjectDetails, etc.)
    }), [
      projects,
      loadingCreate,
      errorCreate,
      loadingFetch,
      errorFetch,
      createProject,
      fetchUserProjects,
    ]);
  
    return (
      <ProjectContext.Provider value={contextValue}>
        {children}
      </ProjectContext.Provider>
    );
  };
  
  // Custom hook to use the ProjectContext
  export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
      throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
  };