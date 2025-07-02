import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, UserPlusIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';
import { HiOutlineClipboardList } from 'react-icons/hi';
import { FaUserFriends, FaRobot, FaRegCheckCircle } from 'react-icons/fa';
import { MdDashboard, MdViewColumn } from 'react-icons/md';
import avatarPointingDownward from '../../assets/AvatarPointingDownward.png';
import avatarWithChecklist from '../../assets/AvatarWithChecklistInAir.png';

const onboardingSteps = [
  {
    label: 'Create your first project',
    description: 'Start by creating a project to organize your work.',
    key: 'create_project',
    icon: <HiOutlineClipboardList className="w-7 h-7 text-indigo-500" />,
  },
  {
    label: 'Invite a teammate',
    description: 'Collaborate by inviting others to your project.',
    key: 'invite_teammate',
    icon: <FaUserFriends className="w-7 h-7 text-emerald-500" />,
  },
  {
    label: 'Explore the dashboard',
    description: 'Get familiar with your workspace and tools.',
    key: 'explore_dashboard',
    icon: <MdDashboard className="w-7 h-7 text-violet-500" />,
  },
  {
    label: 'Create a task',
    description: 'Create a task to get started.',
    key: 'create_task',
    icon: <FaRegCheckCircle className="w-7 h-7 text-amber-500" />,
  },
  {
    label: 'Create a new column',
    description: 'Create a new column to organize your tasks.',
    key: 'create_column',
    icon: <MdViewColumn className="w-7 h-7 text-sky-500" />,
  },
  {
    label: 'Use the AI tools',
    description: 'Use the AI tools to enhance tasks, generate new tasks, and more.',
    key: 'use_ai_tools',
    icon: <FaRobot className="w-7 h-7 text-pink-500" />,
  }
];

const Onboarding = ({ userData }) => {
  const [completed, setCompleted] = useState([]);

  const handleStepClick = (key) => {
    setCompleted((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleFinish = () => {
    window.location.reload();
  };

  const progress = (completed.length / onboardingSteps.length) * 100;

  return (
    <div className="relative w-full min-h-full flex flex-col items-center justify-center px-2 -mt-5">
      {/* Logo and Onboarding Checklist text above the card */}
      <div className="flex flex-col items-center mb-4">
        <img
          src="/favicon.svg"
          alt="Tassot logo"
          className="w-20 h-20"
        />
        <span className="text-2xl sm:text-4xl font-bold text-text-primary tracking-wide">Onboarding Checklist</span>
      </div>
      {/* Onboarding card with avatars */}
      <div className="mt-6 max-w-4xl mx-auto rounded-2xl z-20 relative shadow-[0_0_32px_0_rgba(167,139,250,0.25)]">
        {/* Avatars on card corners */}
        <img
          src={avatarPointingDownward}
          alt="Avatar pointing downward"
          className="w-20 h-20 sm:w-40 sm:h-40 object-contain z-30 drop-shadow-xl pointer-events-none select-none absolute -top-37.5 left-5"
        />
        <img
          src={avatarWithChecklist}
          alt="Avatar with checklist"
          className="w-20 h-20 sm:w-40 sm:h-40 object-contain z-30 drop-shadow-xl pointer-events-none select-none scale-x-[-1] absolute -top-38.5 right-5"
        />
        <motion.div
          className="flex flex-col items-center justify-center p-8 bg-bg-secondary/60 backdrop-blur-2xl rounded-2xl shadow-2xl relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
        >
          {/* Progress Bar */}
          <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-text-secondary">Onboarding Progress</span>
              <span className="text-xs text-text-tertiary">{completed.length} / {onboardingSteps.length} steps</span>
            </div>
            <div className="w-full h-3 bg-bg-tertiary rounded-full overflow-hidden">
              <motion.div
                className="h-3 bg-success rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, type: 'spring' }}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {/* Welcome */}
          <motion.h2
            className="text-3xl font-bold text-text-primary mb-2 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Welcome, {' '}
            <span className="animated-gradient-text">
              {userData?.first_name || 'User'} {' '} {userData?.last_name || ''}
            </span>
          </motion.h2>
          <motion.p
            className="text-text-secondary text-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Follow these steps to set up your workspace and begin collaborating.
          </motion.p>
          <div className="w-40 h-1 rounded-full bg-accent-primary mb-8" aria-hidden="true"></div>
          {/* Checklist */}
          <ul className="w-full mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {onboardingSteps.map((step, idx) => {
              const isDone = completed.includes(step.key);
              return (
                <motion.li
                  key={step.key}
                  className={`flex items-center gap-4 p-4 rounded-xl border hover:border-accent-secondary hover:border-2 transition-colors cursor-pointer select-none shadow-sm h-full ${isDone ? 'bg-success/10 border-success' : 'bg-bg-tertiary border-border-secondary hover:bg-bg-tertiary/80'}`}
                  tabIndex={0}
                  aria-checked={isDone}
                  role="checkbox"
                  onClick={() => handleStepClick(step.key)}
                  onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && handleStepClick(step.key)}
                  aria-label={step.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx, duration: 0.4 }}
                >
                  <span className="flex items-center justify-center w-9 h-9 rounded-full">
                    {step.icon}
                  </span>
                  <div className="flex-1">
                    <span className="block text-lg font-semibold text-text-primary">{step.label}</span>
                    <span className="block text-text-secondary text-sm">{step.description}</span>
                  </div>
                  <AnimatePresence>
                    {isDone && (
                      <motion.span
                        className="ml-2"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      >
                        <CheckCircleIcon className="w-7 h-7 text-success" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ul>
          {/* CTA Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-3 mt-2">
            <button
              className="flex-1 py-3 px-6 bg-accent-primary hover:bg-accent-primary/90 text-text-inverse font-bold rounded-lg text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 flex items-center justify-center gap-2 shadow-md"
              onClick={handleFinish}
              aria-label="Finish onboarding and start using Tassot"
            >
              <RocketLaunchIcon className="w-6 h-6 mr-1" />
              Start Using Tassot
            </button>
            <button
              className="flex-1 py-3 px-6 bg-bg-tertiary hover:bg-bg-secondary text-text-secondary rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-border-primary focus:ring-offset-2 flex items-center justify-center gap-2 shadow-sm"
              onClick={handleFinish}
              aria-label="Skip onboarding"
            >
              Skip for now
            </button>
          </div>
        </motion.div>
      </div>
      {/* Subtle animated background shapes (now more visible) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-pink-400/30 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-400/30 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-fuchsia-400/20 rounded-full blur-2xl animate-pulse" style={{ transform: 'translate(-50%, -50%)' }} />
      </div>
    </div>
  );
};

Onboarding.propTypes = {
  userData: PropTypes.object,
};

export default Onboarding; 