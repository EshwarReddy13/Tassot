import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference, default to light mode
    const saved = localStorage.getItem('theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    // Default to light mode if no preference saved
    return false;
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const setTheme = (darkMode) => {
    setIsDarkMode(darkMode);
  };

  // Set initial theme on app load
  useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem('theme');
    const shouldBeDark = saved === 'dark' || (saved === null && false); // false = light mode default
    
    if (shouldBeDark) {
      root.classList.add('dark');
      console.log('Initial theme set to dark mode');
    } else {
      root.classList.remove('dark');
      console.log('Initial theme set to light mode');
    }
  }, []);

  // Save theme preference to localStorage and apply theme
  useEffect(() => {
    const root = document.documentElement;
    
    // Check if we're on the login page
    const isLoginPage = location.pathname === '/login';
    
    if (isLoginPage) {
      // Force dark mode for login page
      root.classList.add('dark');
      console.log('Login page: Forcing dark mode');
    } else {
      // Use user's theme preference for other pages
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
      
      if (isDarkMode) {
        root.classList.add('dark');
        console.log('Theme set to dark mode');
      } else {
        root.classList.remove('dark');
        console.log('Theme set to light mode');
      }
    }
    
    // Debug: Check if the class was set
    console.log('Current theme classes:', root.className);
  }, [isDarkMode, location.pathname]);

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