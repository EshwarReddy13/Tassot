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

    const value = useMemo(() => ({
        enhanceTaskName,
        enhanceTaskDescription,
        isAIContextLoading: isLoading,
        aiContextError: error,
    }), [isLoading, error, enhanceTaskName, enhanceTaskDescription]);

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