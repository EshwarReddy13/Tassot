import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import App from './App.jsx';
import { UserProvider } from './contexts/UserContext.jsx'; 
import { ProjectProvider } from './contexts/ProjectContext.jsx';
import { DashboardProvider } from './contexts/DashboardContext.jsx';
import { AIProvider } from './contexts/AIContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { NavbarProvider } from './contexts/NavbarContext.jsx';

import Login from './components/login/LoginPage.jsx';
import Signup from './components/login/SignupPage.jsx';
import VerifyEmailPage from './components/login/VerifyEmailPage.jsx';
import AcceptInvitePage from './components/projects/pages/AcceptInvitePage.jsx'; 

import Dashboard from './components/dashboard/HomePage.jsx';

import Projects from './components/projects/pages/ProjectsPage.jsx';
import ProjectPage from './components/projects/pages/ProjectView.jsx';
import ProjectSettingsPage from './components/projects/pages/ProjectSettingsPage.jsx';
import ProjectDashboardPage from './components/projects/pages/ProjectDashboardPage.jsx'; 

import SettingsPage from './components/settings/SettingsPage.jsx';
import EmailPage from './components/email/EmailPage.jsx';
import StoragePage from './components/storage/StoragePage.jsx';

import ProjectUsersPage from './components/projects/pages/ProjectUsersPage.jsx';

import PalettePage from './components/palette/PalettePage.jsx';
import NotFoundPage from './components/404/NotFoundPage.jsx';
import LogoutPage from './components/logout/LogoutPage.jsx';

import Layout from './layout.jsx';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <ProjectProvider>
        <DashboardProvider>
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
              <NavbarProvider>
                <Routes>
                {/* Public routes (no navbar) */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/logout" element={<LogoutPage />} />

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
                  <Route path="/email" element={<EmailPage />} />
                  <Route path="/storage" element={<StoragePage />} />
                  <Route path="/palette" element={<PalettePage />} />
                </Route>

                {/* 404 Catch-all route - Must be last */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              </NavbarProvider>
            </ThemeProvider>
          </BrowserRouter>
        </AIProvider>
        </DashboardProvider>
      </ProjectProvider>
    </UserProvider>
  </React.StrictMode>
);
