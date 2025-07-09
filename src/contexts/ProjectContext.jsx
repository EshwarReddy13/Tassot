import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useUser } from './UserContext.jsx';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
    const { firebaseUser } = useUser();

    // States
    const [projects, setProjects] = useState([]);
    const [loadingFetch, setLoadingFetch] = useState(false);
    const [errorFetch, setErrorFetch] = useState(null);
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [errorCreate, setErrorCreate] = useState(null);
    const [currentProject, setCurrentProject] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [errorDetails, setErrorDetails] = useState(null);
    const [projectSettings, setProjectSettings] = useState(null);
    const [isSettingsLoading, setIsSettingsLoading] = useState(true);
    const [settingsError, setSettingsError] = useState(null);
    const [dashboardSummary, setDashboardSummary] = useState(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(true);
    const [summaryError, setSummaryError] = useState(null);
    const [actionItems, setActionItems] = useState(null);
    const [isActionItemsLoading, setIsActionItemsLoading] = useState(true);
    const [actionItemsError, setActionItemsError] = useState(null);
    const [activityFeed, setActivityFeed] = useState(null);
    const [isActivityLoading, setIsActivityLoading] = useState(true);
    const [activityError, setActivityError] = useState(null);

    // Functions
    const fetchUserProjects = useCallback(async () => {
        if (!firebaseUser) { setProjects([]); return; }
        setLoadingFetch(true); setErrorFetch(null);
        try {
            const token = await firebaseUser.getIdToken();
            const res = await fetch('/api/projects', { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || res.statusText);
            setProjects(data);
        } catch (err) { setErrorFetch(err.message); setProjects([]); }
        finally { setLoadingFetch(false); }
    }, [firebaseUser]);

    const createProject = useCallback(async (body) => {
        if (!firebaseUser) throw new Error('Authentication required');
        setLoadingCreate(true); setErrorCreate(null);
        try {
            const token = await firebaseUser.getIdToken();
            const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || res.statusText);
            fetchUserProjects(); return data;
        } catch (err) { setErrorCreate(err.message); throw err; }
        finally { setLoadingCreate(false); }
    }, [firebaseUser, fetchUserProjects]);

    const getProjectDetails = useCallback(async (projectUrl) => {
        if (!firebaseUser) { setErrorDetails('Authentication required to fetch project details.'); return; }
        setLoadingDetails(true); setErrorDetails(null); setCurrentProject(null);
        try {
            const token = await firebaseUser.getIdToken();
            const res = await fetch(`/api/projects/${projectUrl}`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch project data.');
            setCurrentProject(data); return data;
        } catch (err) { setErrorDetails(err.message); setCurrentProject(null); }
        finally { setLoadingDetails(false); }
    }, [firebaseUser]);
    
    const deleteTask = useCallback(async (projectUrl, taskId) => {
        if (!firebaseUser) throw new Error('Authentication required');
        const token = await firebaseUser.getIdToken();
        const res = await fetch(`/api/projects/${projectUrl}/tasks/${taskId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        if (res.status === 204) { setCurrentProject(prev => prev ? { ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) } : null); return; }
        const errorData = await res.json(); throw new Error(errorData.error || 'Failed to delete task.');
    }, [firebaseUser]);

    const createTask = useCallback((newTask) => {
        setCurrentProject(prev => prev ? { ...prev, tasks: [...(prev.tasks || []), newTask] } : null);
    }, []);

    const updateTaskInContext = useCallback((updatedTask) => {
        setCurrentProject(prev => { if (!prev) return null; const newTasks = prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t); return { ...prev, tasks: newTasks }; });
    }, []);

    const deleteBoard = useCallback(async (projectUrl, boardId) => {
        if (!firebaseUser) throw new Error("Authentication required");
        const token = await firebaseUser.getIdToken();
        const res = await fetch(`/api/projects/${projectUrl}/boards/${boardId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        if (res.status === 204) { setCurrentProject(prev => { if (!prev) return null; const newBoards = prev.boards.filter(b => b.id !== boardId); const newTasks = prev.tasks.filter(t => t.board_id !== boardId); return { ...prev, boards: newBoards, tasks: newTasks }; }); return; }
        const errorData = await res.json(); throw new Error(errorData.error || "Failed to delete board.");
    }, [firebaseUser]);

    const updateBoard = useCallback(async (projectUrl, boardId, updateData) => {
        if (!firebaseUser) throw new Error("Authentication required");
        const token = await firebaseUser.getIdToken();
        const res = await fetch(`/api/projects/${projectUrl}/boards/${boardId}`, { 
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
            body: JSON.stringify(updateData) 
        });
        const updatedBoard = await res.json(); 
        if (!res.ok) throw new Error(updatedBoard.error || "Failed to update board.");
        
        setCurrentProject(prev => { 
            if (!prev) return null; 
            const newBoards = prev.boards.map(b => b.id === boardId ? { ...b, ...updatedBoard } : b); 
            return { ...prev, boards: newBoards }; 
        }); 
        
        return updatedBoard;
    }, [firebaseUser]);

    const removeUserFromProject = useCallback(async (projectUrl, memberId) => {
        if (!firebaseUser) throw new Error("Authentication required");
        const token = await firebaseUser.getIdToken();
        const res = await fetch(`/api/projects/${projectUrl}/members/${memberId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        if (res.status === 204) { setCurrentProject(prev => { if (!prev) return null; const newMembers = prev.members.filter(m => m.id !== memberId); return { ...prev, members: newMembers }; }); return; }
        const errorData = await res.json(); throw new Error(errorData.error || "Failed to remove member.");
    }, [firebaseUser]);
    
    const updateMemberRole = useCallback(async (projectUrl, memberId, newRole) => {
        if (!firebaseUser) throw new Error("Authentication required");
        const token = await firebaseUser.getIdToken();
        const res = await fetch(`/api/projects/${projectUrl}/members/${memberId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ role: newRole }) });
        if (!res.ok) { const errorData = await res.json(); throw new Error(errorData.error || "Failed to update member role."); }
        if (newRole === 'owner') { await getProjectDetails(projectUrl); } else { setCurrentProject(prev => { if (!prev) return null; const newMembers = prev.members.map(m => m.id === memberId ? { ...m, role: newRole } : m); return { ...prev, members: newMembers }; }); }
    }, [firebaseUser, getProjectDetails]);

    const getProjectSettings = useCallback(async (projectUrl) => {
        if (!firebaseUser) { setSettingsError("Authentication required."); return; }
        setIsSettingsLoading(true); setSettingsError(null);
        try {
            const token = await firebaseUser.getIdToken(); const res = await fetch(`/api/projects/${projectUrl}/settings`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Failed to fetch project settings.'); setProjectSettings(data);
        } catch (err) { setSettingsError(err.message); } finally { setIsSettingsLoading(false); }
    }, [firebaseUser]);

    const updateProjectSettings = useCallback(async (projectUrl, newSettings) => {
        if (!firebaseUser) throw new Error('Authentication required');
        const token = await firebaseUser.getIdToken(); const res = await fetch(`/api/projects/${projectUrl}/settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(newSettings) });
        const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Failed to update settings.'); setProjectSettings(data); return data;
    }, [firebaseUser]);

    const updateProjectDetails = useCallback(async (projectUrl, projectDetails) => {
        if (!firebaseUser) throw new Error('Authentication required');
        const token = await firebaseUser.getIdToken();
        
        // Transform frontend field names to backend expected names
        const transformedData = {
            project_name: projectDetails.projectName,
            project_key: projectDetails.projectKey,
            description: projectDetails.description,
            projectType: projectDetails.projectType,
            currentPhase: projectDetails.currentPhase,
            teamSize: projectDetails.teamSize,
            complexityLevel: projectDetails.complexityLevel
        };
        
        const res = await fetch(`/api/projects/${projectUrl}`, { 
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
            body: JSON.stringify(transformedData) 
        });
        const data = await res.json(); 
        if (!res.ok) throw new Error(data.error || 'Failed to update project details.'); 
        
        // Update current project if it exists
        if (currentProject) {
            setCurrentProject(prev => ({
                ...prev,
                project: {
                    ...prev.project,
                    project_name: projectDetails.projectName,
                    project_key: projectDetails.projectKey,
                    description: projectDetails.description
                }
            }));
        }
        
        // Refresh project settings to get updated project_details
        await getProjectSettings(projectUrl);
        
        return data;
    }, [firebaseUser, currentProject, getProjectSettings]);

    const getDashboardSummary = useCallback(async (projectUrl) => {
        if (!firebaseUser) { setSummaryError("Authentication required."); return; }
        setIsSummaryLoading(true); setSummaryError(null);
        try {
            const token = await firebaseUser.getIdToken();
            const res = await fetch(`/api/projects/${projectUrl}/dashboard/summary`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch dashboard summary.');
            setDashboardSummary(data);
        } catch (err) { setSummaryError(err.message); }
        finally { setIsSummaryLoading(false); }
    }, [firebaseUser]);

    const getActionItems = useCallback(async (projectUrl) => {
        if (!firebaseUser) { setActionItemsError("Authentication required."); return; }
        setIsActionItemsLoading(true); setActionItemsError(null);
        try {
            const token = await firebaseUser.getIdToken();
            const res = await fetch(`/api/projects/${projectUrl}/dashboard/action-items`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch action items.');
            setActionItems(data);
        } catch (err) { setActionItemsError(err.message); }
        finally { setIsActionItemsLoading(false); }
    }, [firebaseUser]);

    const getActivityFeed = useCallback(async (projectUrl) => {
        if (!firebaseUser) { setActivityError("Authentication required."); return; }
        setIsActivityLoading(true);
        setActivityError(null);
        try {
            const token = await firebaseUser.getIdToken();
            const res = await fetch(`/api/projects/${projectUrl}/dashboard/activity`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch activity feed.');
            setActivityFeed(data);
        } catch (err) {
            setActivityError(err.message);
        } finally {
            setIsActivityLoading(false);
        }
    }, [firebaseUser]);

    // New functions for pinning and reordering
    const pinProject = useCallback(async (projectUrl) => {
        if (!firebaseUser) throw new Error('Authentication required');
        try {
            const token = await firebaseUser.getIdToken();
            const res = await fetch(`/api/projects/${projectUrl}/pin`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to pin project');
            
            // Update the projects list to reflect the new pin status
            await fetchUserProjects();
            return data;
        } catch (err) {
            throw err;
        }
    }, [firebaseUser, fetchUserProjects]);

    const updateProjectOrder = useCallback(async (projectOrders) => {
        if (!firebaseUser) throw new Error('Authentication required');
        try {
            const token = await firebaseUser.getIdToken();
            const res = await fetch('/api/projects/order', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json', 
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ projectOrders })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update project order');
            
            // Update the projects list to reflect the new order
            await fetchUserProjects();
            return data;
        } catch (err) {
            throw err;
        }
    }, [firebaseUser, fetchUserProjects]);

    // Auto-fetch projects when user is available
    useEffect(() => {
        if (firebaseUser) {
            fetchUserProjects();
        }
    }, [firebaseUser, fetchUserProjects]);

    const value = useMemo(() => ({
        projects, loadingFetch, errorFetch, createProject, loadingCreate, errorCreate, currentProject, loadingDetails, errorDetails, fetchUserProjects, getProjectDetails, deleteTask, createTask, updateTaskInContext, deleteBoard, updateBoard, removeUserFromProject, updateMemberRole, projectSettings, isSettingsLoading, settingsError, getProjectSettings, updateProjectSettings, updateProjectDetails, dashboardSummary, isSummaryLoading, summaryError, getDashboardSummary,
        actionItems, isActionItemsLoading, actionItemsError, getActionItems,
        activityFeed, isActivityLoading, activityError, getActivityFeed,
        pinProject, updateProjectOrder
    }),
    [
        // State
        projects, loadingFetch, errorFetch, loadingCreate, errorCreate, currentProject, loadingDetails, errorDetails, projectSettings, isSettingsLoading, settingsError, dashboardSummary, isSummaryLoading, summaryError, actionItems, isActionItemsLoading, actionItemsError, activityFeed, isActivityLoading, activityError,
        // Functions
        createProject, fetchUserProjects, getProjectDetails, deleteTask, createTask, updateTaskInContext, deleteBoard, updateBoard, removeUserFromProject, 
        updateMemberRole, getProjectSettings, updateProjectSettings, updateProjectDetails, getDashboardSummary, getActionItems, getActivityFeed, pinProject, updateProjectOrder
    ]);

    return ( <ProjectContext.Provider value={value}> {children} </ProjectContext.Provider> );
};

export const useProjects = () => { const ctx = useContext(ProjectContext); if (!ctx) throw new Error('useProjects must be used within a ProjectProvider'); return ctx; };