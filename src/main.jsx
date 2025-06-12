import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import App from './App.jsx';
import { UserProvider } from './contexts/UserContext.jsx'; 
import { ProjectProvider } from './contexts/ProjectContext.jsx';

import Login from './components/login/loginPage.jsx';
import Signup from './components/login/signupPage.jsx';
import VerifyEmailPage from './components/login/verifyEmailPage.jsx';
import AcceptInvitePage from './components/projects/acceptInvitePage.jsx'; 

import Dashboard from './components/dashboard/dashboardPage.jsx';

import Projects from './components/projects/projectsPage.jsx';
import ProjectPage from './components/projects/projectView.jsx';

import SettingsPage from './components/settings/settingsPage.jsx';

import Layout from './layout.jsx';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <ProjectProvider>
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
          <Routes>
            {/* Public routes (no navbar) */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            <Route path="/accept-invite" element={<AcceptInvitePage />} />

            {/* Routes with navbar */}
            <Route element={<Layout />}>
              <Route path="/" element={<App />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:projectUrl" element={<ProjectPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ProjectProvider>
    </UserProvider>
  </React.StrictMode>
);
