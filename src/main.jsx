import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App.jsx';
import { UserProvider } from './components/global widgets/user_provider.jsx';
import { DocumentProvider } from './components/global widgets/document_provider.jsx';

import Login from './components/login/login_page.jsx';
import Signup from './components/login/signup_page.jsx';
import VerifyEmailPage from './components/login/verify_email_page.jsx';

import Dashboard from './components/dashboard/dashboard_page.jsx';

import Projects from './components/projects/projects_page.jsx';
import ProjectPage from './components/projects/project_view.jsx';

import SettingsPage from './components/settings/settings_page.jsx';

import Layout from './layout.jsx';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <DocumentProvider>
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
              <Route path="/projects/:projectId" element={<ProjectPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* Add other pages here like /projects, /settings */}
            </Route>
          </Routes>
        </BrowserRouter>
      </DocumentProvider>
    </UserProvider>
  </React.StrictMode>
);
