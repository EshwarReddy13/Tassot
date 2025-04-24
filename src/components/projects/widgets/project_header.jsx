import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDocuments } from '../../global widgets/document_provider.jsx';

const ProjectHeader = () => {
  const { projectId } = useParams();
  const { getProject, error, loading } = useDocuments();
  const [projectName, setProjectName] = useState('Project');

  useEffect(() => {
    if (projectId) {
      const fetchProjectName = async () => {
        try {
          const projectData = await getProject(projectId);
          setProjectName(projectData.projectName || 'Project');
        } catch (err) {
          console.error('Failed to fetch project name:', err);
          setProjectName('Project');
        }
      };
      fetchProjectName();
    } else {
      setProjectName('Project');
    }
  }, [projectId, getProject]);

  return (
    <header className="fixed top-0 left-0 ml-[17rem] right-0 h-[4rem] bg-[#292830] flex items-center justify-between px-6">
      <motion.h1
        className="text-white text-xl font-bold"
        style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {loading ? 'Loading...' : projectName}
      </motion.h1>

      <div className="flex items-center space-x-4">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <input
            type="search"
            className="w-[12rem] pl-8 pr-2 py-1 rounded-md bg-[#17171b] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#9674da]"
            placeholder="Search..."
            aria-label="Search projects"
          />
          <svg
            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </motion.div>

        <motion.button
          className="p-2 rounded-md text-white hover:bg-[#9674da] focus:bg-[#9674da] focus:outline-none focus:ring-2 focus:ring-[#9674da]"
          aria-label="Filter projects"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1m-2 6a1 1 0 011 1h-4m-2 0a1 1 0 011 1m-2 6h4m2 0a1 1 0 01-1 1H4a1 1 0 01-1-1m2-6H3" />
          </svg>
        </motion.button>

        <motion.button
          className="p-2 rounded-md text-white hover:bg-[#9674da] focus:bg-[#9674da] focus:outline-none focus:ring-2 focus:ring-[#9674da]"
          aria-label="Help"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.951 2.601-4.02 3.467-.746.317-1.48.533-1.98.533-.5 0-1-.267-1-1 0-1.333 2-1.333 2 0 0 .4.493.6 1 .6.507 0 1-.067 1-.6 0-.667-1.333-.667-1.333 0 0 .333.267.667.667.667.4 0 .667-.333.667-.667 0-1.333-2.667-1.333-2.667 0 0 .333.267.667.667.667.4 0 .667-.333.667-.667V9zm3.772 9c-.549 0-1-.447-1-1s.451-1 1-1 1 .447 1 1-.451 1-1 1z" />
          </svg>
        </motion.button>

        <motion.button
          className="p-2 rounded-md text-white hover:bg-[#9674da] focus:bg-[#9674da] focus:outline-none focus:ring-2 focus:ring-[#9674da]"
          aria-label="Notifications"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v.341C4.67 6.165 4 7.388 4 9v5.158c0 .733-.322 1.43-.895 1.905L2 17h5m8 0v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2m8-2H7" />
          </svg>
        </motion.button>

        <motion.button
          className="p-2 rounded-md text-white hover:bg-[#9674da] focus:bg-[#9674da] focus:outline-none focus:ring-2 focus:ring-[#9674da]"
          aria-label="Profile"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </motion.button>
      </div>
    </header>
  );
};

export default ProjectHeader;