import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useUser } from './UserContext';

const AIContext = createContext();

export const AIProvider = ({ children }) => {
    const { firebaseUser } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const callApi = useCallback(async (endpoint, text) => {
        if (!firebaseUser) throw new Error('Authentication required.');
        if (!text || !text.trim()) throw new Error('Cannot enhance empty text.');

        setIsLoading(true);
        setError(null);

        try {
            const token = await firebaseUser.getIdToken();
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ text }),
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

    const enhanceTaskName = useCallback((text) => callApi('/api/ai/tasks/task-name', text), [callApi]);
    const enhanceTaskDescription = useCallback((text) => callApi('/api/ai/tasks/task-description', text), [callApi]);

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