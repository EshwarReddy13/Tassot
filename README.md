# 🚀 Tassot - Futuristic Project Management Platform

<div align="center">

![Tassot Logo](https://img.shields.io/badge/ProjectFlow-Project%20Management-blue?style=for-the-badge&logo=react)
![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18.0+-339933?style=for-the-badge&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0+-38B2AC?style=for-the-badge&logo=tailwind-css)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)
[![Code Style](https://img.shields.io/badge/code%20style-prettier-ff69b4.svg?style=for-the-badge)](https://prettier.io/)

*A modern, collaborative project management platform built with React, Node.js, and PostgreSQL*

[🚀 Live Demo](#) • [📖 Documentation](#) • [🐛 Report Bug](#) • [💡 Request Feature](#)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📁 Project Structure](#-project-structure)
- [🎨 UI/UX Features](#-uiux-features)
- [🔐 Authentication & Security](#-authentication--security)
- [🤖 AI-Powered Features](#-ai-powered-features)
- [📱 Responsive Design](#-responsive-design)
- [🧪 Testing](#-testing)
- [📚 Storybook](#-storybook)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 🎯 Core Project Management
- **📊 Kanban Board**: Drag-and-drop task management with customizable columns
- **📋 Task Management**: Create, edit, and organize tasks with rich descriptions
- **👥 Team Collaboration**: Invite team members with role-based permissions
- **📈 Project Dashboard**: Real-time project health metrics and analytics
- **📝 Comments & Discussions**: Thread-based commenting system on tasks
- **📌 Pin Projects**: Quick access to frequently used projects

### 🤖 AI-Enhanced Features
- **🧠 AI Task Creation**: Generate tasks using natural language descriptions
- **✍️ Smart Content Enhancement**: AI-powered task name and description improvements
- **🎯 Intelligent Suggestions**: Context-aware recommendations for task management

### 🎨 Modern UI/UX
- **🌙 Dark Theme**: Beautiful dark mode with customizable color schemes
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **⚡ Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **♿ Accessibility**: WCAG compliant with keyboard navigation support

### 🔐 Security & Authentication
- **🔥 Firebase Authentication**: Secure email/password and Google OAuth
- **🔒 Role-Based Access**: Admin, Member, and Viewer permissions
- **🛡️ JWT Protection**: Secure API endpoints with token-based authentication
- **📧 Email Verification**: Multi-step account verification process

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.0+ | UI Framework |
| **Vite** | 6.0+ | Build Tool & Dev Server |
| **TailwindCSS** | 3.0+ | Utility-First CSS Framework |
| **Framer Motion** | 10.0+ | Animation Library |
| **React Router** | 6.0+ | Client-Side Routing |
| **React Hot Toast** | 2.0+ | Notification System |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18.0+ | Runtime Environment |
| **Express.js** | 4.0+ | Web Framework |
| **PostgreSQL** | 15.0+ | Primary Database |
| **Neon** | Latest | Serverless PostgreSQL |
| **Firebase Admin** | Latest | Authentication & Admin SDK |

### Development Tools
| Tool | Purpose |
|------|---------|
| **ESLint** | Code Linting |
| **Prettier** | Code Formatting |
| **Storybook** | Component Documentation |
| **Jest** | Testing Framework |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.0 or higher)
- **npm** or **yarn**
- **PostgreSQL** database (or Neon account)
- **Firebase** project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/project-management.git
   cd project-management
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Frontend (.env)
   VITE_API_URL=http://localhost:3001
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   
   # Backend (.env)
   DATABASE_URL=your_neon_postgresql_url
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY=your_private_key
   FIREBASE_CLIENT_EMAIL=your_client_email
   JWT_SECRET=your_jwt_secret
   ```

4. **Database Setup**
   ```bash
   # The application will automatically create tables on first run
   # Ensure your PostgreSQL database is running and accessible
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Start backend server
   cd backend
   npm run dev
   
   # Terminal 2: Start frontend development server
   npm run dev
   ```

6. **Open your browser**
   ```
   Frontend: http://localhost:5173
   Backend API: http://localhost:3001
   ```

### Production Deployment

```bash
# Build frontend for production
npm run build

# Start production server
npm run preview
```

---

## 📁 Project Structure

```
project-management/
├── 📁 src/
│   ├── 📁 components/
│   │   ├── 📁 login/           # Authentication components
│   │   ├── 📁 dashboard/       # Dashboard & widgets
│   │   ├── 📁 projects/        # Project management
│   │   │   ├── 📁 pages/       # Project pages
│   │   │   ├── 📁 shared/      # Reusable components
│   │   │   ├── 📁 tasks/       # Task management
│   │   │   ├── 📁 modals/      # Modal components
│   │   │   ├── 📁 comments/    # Comment system
│   │   │   └── 📁 ai/          # AI-powered features
│   │   ├── 📁 settings/        # User settings
│   │   └── 📁 navbar/          # Navigation
│   ├── 📁 contexts/            # React contexts
│   ├── 📁 assets/              # Images & fonts
│   └── 📁 stories/             # Storybook stories
├── 📁 backend/
│   ├── 📁 controllers/         # API controllers
│   ├── 📁 routes/              # API routes
│   ├── 📁 middleware/          # Express middleware
│   └── 📁 services/            # Business logic
├── 📁 tests/                   # Test files
└── 📁 public/                  # Static assets
```

---

## 🎨 UI/UX Features

### 🎨 Design System
- **Custom Font**: StyreneA font family for modern typography
- **Color Palette**: Consistent theming with CSS custom properties
- **Component Library**: Reusable, accessible components
- **Icon System**: Heroicons integration for consistent iconography

### 🎭 Animations & Interactions
```jsx
// Example: Smooth page transitions
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  <ProjectCard />
</motion.div>
```

### 📱 Responsive Breakpoints
| Device | Breakpoint | Layout |
|--------|------------|--------|
| Mobile | < 768px | Single column, stacked |
| Tablet | 768px - 1024px | Two column layout |
| Desktop | > 1024px | Full layout with sidebar |

---

## 🔐 Authentication & Security

### 🔥 Firebase Integration
- **Email/Password**: Traditional authentication
- **Google OAuth**: One-click Google sign-in
- **Email Verification**: Multi-step account verification
- **Password Strength**: Real-time password validation

### 🛡️ Security Features
```javascript
// JWT Token Verification
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 👥 Role-Based Access Control
| Role | Permissions |
|------|-------------|
| **Admin** | Full project control, user management |
| **Member** | Create/edit tasks, comment, view project |
| **Viewer** | View-only access to project |

---

## 🤖 AI-Powered Features

### 🧠 AI Task Creation
```jsx
// AI-enhanced task creation
const createTaskWithAI = async (description) => {
  const response = await fetch('/api/ai/create-task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description })
  });
  return response.json();
};
```

### ✍️ Content Enhancement
- **Smart Task Names**: AI-generated concise task titles
- **Description Enhancement**: Expand brief descriptions with context
- **Context Awareness**: Understands project context for better suggestions

---

## 📱 Responsive Design

### 📱 Mobile-First Approach
- **Touch-Friendly**: Optimized for touch interactions
- **Gesture Support**: Swipe gestures for task management
- **Offline Capability**: Basic offline functionality
- **Progressive Web App**: Installable as native app

### 🖥️ Desktop Experience
- **Keyboard Shortcuts**: Power user shortcuts
- **Drag & Drop**: Intuitive task organization
- **Multi-Select**: Batch operations on tasks
- **Split Views**: Multiple projects side-by-side

---

## 🧪 Testing

### 🧪 Test Coverage
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:backend
npm run test:frontend
```

### 📊 Test Structure
```
tests/
├── 📁 backend/
│   ├── 📁 controllers/
│   ├── 📁 middleware/
│   └── 📁 services/
└── 📁 frontend/
    ├── 📁 components/
    ├── 📁 hooks/
    └── 📁 utils/
```

---

## 📚 Storybook

### 📖 Component Documentation
```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

### 🎨 Story Examples
```jsx
// Example: ProjectCard story
export default {
  title: 'Components/ProjectCard',
  component: ProjectCard,
  parameters: {
    layout: 'centered',
  },
};

export const Default = {
  args: {
    project: {
      id: '1',
      name: 'Sample Project',
      description: 'A sample project for testing',
      status: 'active'
    }
  }
};
```
---

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **TailwindCSS** for the utility-first CSS approach
- **Framer Motion** for smooth animations
- **Firebase** for authentication services
- **Neon** for serverless PostgreSQL

---

<div align="center">

**Made with ❤️ by a jobless and bored dude**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/project-management?style=social)](https://github.com/yourusername/project-management/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/project-management?style=social)](https://github.com/yourusername/project-management/network)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/project-management)](https://github.com/yourusername/project-management/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/project-management)](https://github.com/yourusername/project-management/pulls)

</div>
