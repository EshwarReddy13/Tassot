import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import App from './App.jsx';
import { UserProvider } from './contexts/UserContext.jsx'; 
import { ProjectProvider } from './contexts/ProjectContext.jsx';
import { AIProvider } from './contexts/AIContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';

import Login from './components/login/loginPage.jsx';
import Signup from './components/login/signupPage.jsx';
import VerifyEmailPage from './components/login/verifyEmailPage.jsx';
import AcceptInvitePage from './components/projects/pages/acceptInvitePage.jsx'; 

import Dashboard from './components/dashboard/dashboardPage.jsx';

import Projects from './components/projects/pages/projectsPage.jsx';
import ProjectPage from './components/projects/pages/projectView.jsx';
import ProjectSettingsPage from './components/projects/pages/projectSettingsPage.jsx';
import ProjectDashboardPage from './components/projects/pages/projectDashboardPage.jsx'; 

import SettingsPage from './components/settings/settingsPage.jsx';

import ProjectUsersPage from './components/projects/pages/projectUsersPage.jsx';

import PalettePage from './components/palette/palettePage.jsx';

import Layout from './layout.jsx';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <ProjectProvider>
        <AIProvider>
          {/* --- CONFIGURED TOASTER PROVIDER --- */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-bg-secondary)',
              },
              success: {
                iconTheme: {
                  primary: 'var(--color-success)',
                  secondary: 'var(--color-bg-card)',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--color-error)',
                  secondary: 'var(--color-bg-card)',
                },
              },
            }}
          />
          <BrowserRouter>
            <ThemeProvider>
              <Routes>
                {/* Public routes (no navbar) */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />

                <Route path="/accept-invite" element={<AcceptInvitePage />} />

                {/* Routes with navbar */}
                <Route element={<Layout />}>
                  <Route path="/" element={<App />} />
                  <Route path="/home" element={<Dashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:projectUrl" element={<ProjectPage />}>
                      <Route index element={null} /> {/* This handles the base `/projects/:projectUrl` path */}
                      <Route path="dashboard" element={<ProjectDashboardPage />} />
                      <Route path="users" element={<ProjectUsersPage />} />
                      <Route path="settings" element={<ProjectSettingsPage />} />
                      {/* You could add other nested project pages like "settings", "reports", etc. here later */}
                  </Route>
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/palette" element={<PalettePage />} />
                </Route>
              </Routes>
            </ThemeProvider>
          </BrowserRouter>
        </AIProvider>
      </ProjectProvider>
    </UserProvider>
  </React.StrictMode>
);
