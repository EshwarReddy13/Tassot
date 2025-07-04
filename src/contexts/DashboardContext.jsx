import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useUser } from './UserContext.jsx';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const { firebaseUser } = useUser();

  // States
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's tasks
  const fetchUserTasks = useCallback(async () => {
    if (!firebaseUser) return;
    
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/projects/my-tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
    }
  }, [firebaseUser]);

  // Fetch recent activities
  const fetchRecentActivities = useCallback(async () => {
    if (!firebaseUser) return;
    
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/projects/recent-activities', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      
      const data = await response.json();
      setActivities(data);
    } catch (err) {
      console.error('Error fetching activities:', err);
      // Don't set error for activities as it's not critical
    }
  }, [firebaseUser]);

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    if (!firebaseUser) return;
    
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/projects/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      
      const data = await response.json();
      setDashboardStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      // Don't set error for stats as it's not critical
    }
  }, [firebaseUser]);

  // Initialize dashboard data
  const initializeDashboard = useCallback(async () => {
    if (!firebaseUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all data in parallel
      await Promise.all([
        fetchUserTasks(),
        fetchRecentActivities(),
        fetchDashboardStats()
      ]);
    } catch (err) {
      console.error('Error initializing dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, fetchUserTasks, fetchRecentActivities, fetchDashboardStats]);

  // Refresh dashboard data
  const refreshDashboard = useCallback(async () => {
    if (!firebaseUser) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchUserTasks(),
        fetchRecentActivities(),
        fetchDashboardStats()
      ]);
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, fetchUserTasks, fetchRecentActivities, fetchDashboardStats]);

  // Initialize dashboard when user changes
  useEffect(() => {
    initializeDashboard();
  }, [initializeDashboard]);

  const value = {
    tasks,
    activities,
    dashboardStats,
    loading,
    error,
    refreshDashboard,
    fetchUserTasks,
    fetchRecentActivities,
    fetchDashboardStats
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return ctx;
}; 