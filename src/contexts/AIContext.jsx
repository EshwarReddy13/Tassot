import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useUser } from './UserContext';

const AIContext = createContext();

export const AIProvider = ({ children }) => {
    const { firebaseUser } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // UPDATED: 'callApi' now accepts a single payload object for more flexibility
    const callApi = useCallback(async (endpoint, payload) => {
        if (!firebaseUser) throw new Error('Authentication required.');
        if (!payload || !payload.text || !payload.text.trim()) throw new Error('Cannot enhance empty text.');
        if (!payload.projectUrl) throw new Error('projectUrl is required for AI context.'); // Added validation

        setIsLoading(true);
        setError(null);

        try {
            const token = await firebaseUser.getIdToken();
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                // UPDATED: The entire payload object is now sent in the body
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to get AI suggestion.');
            return data.enhancedText;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [firebaseUser]);

    // UPDATED: Now accepts projectUrl and passes it down
    const enhanceTaskName = useCallback((text, projectUrl) => {
        return callApi('/api/ai/tasks/task-name', { text, projectUrl });
    }, [callApi]);

    // UPDATED: Now accepts taskName and projectUrl for full context
    const enhanceTaskDescription = useCallback((text, taskName, projectUrl) => {
        return callApi('/api/ai/tasks/task-description', { text, taskName, projectUrl });
    }, [callApi]);

    // NEW: AI-powered task creation with project context
    const createTaskWithAI = useCallback(async (userDescription, projectUrl, boardName, isFinalCreation = false) => {
        if (!firebaseUser) throw new Error('Authentication required.');
        if (!userDescription || !userDescription.trim()) throw new Error('Task description is required.');
        if (!projectUrl) throw new Error('Project URL is required for AI context.');

        setIsLoading(true);
        setError(null);

        try {
            const token = await firebaseUser.getIdToken();
            
            // Get the board ID from the board name by making a request to get project details
            const projectRes = await fetch(`/api/projects/${projectUrl}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!projectRes.ok) {
                throw new Error('Failed to fetch project details.');
            }
            
            const projectData = await projectRes.json();
            const board = projectData.boards?.find(b => b.name === boardName);
            
            if (!board) {
                throw new Error('Board not found.');
            }

            const res = await fetch(`/api/ai/tasks/create/${projectUrl}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    userDescription,
                    boardId: board.id,
                    isFinalCreation
                }),
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create task with AI.');
            
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [firebaseUser]);

    const value = useMemo(() => ({
        enhanceTaskName,
        enhanceTaskDescription,
        createTaskWithAI,
        isAIContextLoading: isLoading,
        aiContextError: error,
    }), [isLoading, error, enhanceTaskName, enhanceTaskDescription, createTaskWithAI]);

    return (
        <AIContext.Provider value={value}>
            {children}
        </AIContext.Provider>
    );
};

export const useAI = () => {
    const context = useContext(AIContext);
    if (!context) {
        throw new Error('useAI must be used within an AIProvider');
    }
    return context;
};