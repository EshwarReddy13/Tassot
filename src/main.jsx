import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App.jsx';
import { UserProvider } from './contexts/UserContext.jsx'; 
import { ProjectProvider } from './contexts/ProjectContext.jsx';

import Login from './components/login/loginPage.jsx';
import Signup from './components/login/signupPage.jsx';
import VerifyEmailPage from './components/login/verifyEmailPage.jsx';

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
        <BrowserRouter>
          <Routes>
            {/* Public routes (no navbar) */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Routes with navbar */}
            <Route element={<Layout />}>
              <Route path="/" element={<App />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:projectUrl" element={<ProjectPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* Add other pages here like /projects, /settings */}
            </Route>
          </Routes>
        </BrowserRouter>
      </ProjectProvider>
    </UserProvider>
  </React.StrictMode>
);
