import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference, default to dark mode
    const saved = localStorage.getItem('theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    // Default to dark mode if no preference saved
    return true;
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const setTheme = (darkMode) => {
    setIsDarkMode(darkMode);
  };

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Apply theme to document root for CSS custom properties
    const root = document.documentElement;
    
    if (isDarkMode) {
      // Dark theme colors
      root.style.setProperty('--color-bg-primary', '#292830');
      root.style.setProperty('--color-bg-secondary', '#3a3a44');
      root.style.setProperty('--color-bg-card', '#17171b');
      root.style.setProperty('--color-bg-dark', '#17171b');
      root.style.setProperty('--color-accent-primary', '#9674da');
      root.style.setProperty('--color-accent-hover', '#7e5cb7');
      root.style.setProperty('--color-text-primary', '#ffffff');
      root.style.setProperty('--color-text-secondary', '#a0a0a0');
      root.style.setProperty('--color-text-placeholder', '#6b7280');
      root.style.setProperty('--color-error', '#f87171');
      root.style.setProperty('--color-warning', '#f87171');
      root.style.setProperty('--color-info', '#3b82f6');
      root.style.setProperty('--color-success', '#34d399');
    } else {
      // Light theme colors
      root.style.setProperty('--color-bg-primary', '#f8fafc');
      root.style.setProperty('--color-bg-secondary', '#f1f5f9');
      root.style.setProperty('--color-bg-card', '#ffffff');
      root.style.setProperty('--color-bg-dark', '#e2e8f0');
      root.style.setProperty('--color-accent-primary', '#7c3aed');
      root.style.setProperty('--color-accent-hover', '#6d28d9');
      root.style.setProperty('--color-text-primary', '#1e293b');
      root.style.setProperty('--color-text-secondary', '#64748b');
      root.style.setProperty('--color-text-placeholder', '#94a3b8');
      root.style.setProperty('--color-error', '#ef4444');
      root.style.setProperty('--color-warning', '#f59e0b');
      root.style.setProperty('--color-info', '#3b82f6');
      root.style.setProperty('--color-success', '#10b981');
    }
  }, [isDarkMode]);

  const value = {
    isDarkMode,
    toggleTheme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 