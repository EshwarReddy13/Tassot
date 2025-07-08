import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AITaskCreationModal = ({ isOpen, onClose, onSubmit, isGenerating = false }) => {
    const [userDescription, setUserDescription] = useState('');
    const [error, setError] = useState('');

    // ESC key handler
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && isOpen && !isGenerating) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, isGenerating]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!userDescription.trim()) {
            setError('Please enter a task description.');
            return;
        }

        if (userDescription.length > 1000) {
            setError('Task description cannot exceed 1000 characters.');
            return;
        }

        if (isGenerating) return; // Prevent multiple calls

        setError('');

        try {
            const result = await onSubmit(userDescription);
            handleClose();
        } catch (err) {
            console.error('Failed to generate task:', err);
            toast.error(err.message || 'Failed to generate task with AI.');
        }
    };

    const handleClose = () => {
        setUserDescription('');
        setError('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-bg-dark bg-opacity-70 flex items-center justify-center z-50 p-4"
                    onClick={handleClose}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="ai-task-modal-title"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 30 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 30 }}
                        className="bg-bg-secondary rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="flex items-center justify-between p-4 border-b border-bg-primary">
                            <div className="flex items-center gap-3">
                                <HiSparkles className={`w-6 h-6 ${isGenerating ? 'animate-pulse text-accent-hover' : 'text-accent-primary'}`} />
                                <h2 id="ai-task-modal-title" className="text-lg font-bold text-text-primary">
                                    {isGenerating ? 'Generating Task with AI...' : 'Generate Task with AI'}
                                </h2>
                            </div>
                            <button 
                                onClick={handleClose} 
                                className="p-2 rounded-full text-text-secondary hover:bg-bg-primary"
                                disabled={isGenerating}
                            >
                                <HiX className="w-6 h-6" />
                            </button>
                        </header>
                        
                        <div className="p-6 overflow-y-auto flex-1">
                            {isGenerating ? (
                                // Loading state
                                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-bg-primary border-t-accent-primary rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <HiSparkles className="w-6 h-6 text-accent-primary animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-lg font-semibold text-text-primary">AI is generating your task...</h3>
                                        <p className="text-text-secondary text-sm">
                                            Creating task name, description, and deadline based on your input
                                        </p>
                                        <div className="flex items-center justify-center gap-2 mt-4">
                                            <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Input form
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">
                                            Task Description
                                        </label>
                                        <p className="text-xs text-text-placeholder mb-3">
                                            Describe what you want to accomplish. AI will generate a task name, description, and deadline, then open the task creation form for you to review and edit.
                                        </p>
                                        <textarea
                                            value={userDescription}
                                            onChange={(e) => {
                                                setUserDescription(e.target.value);
                                                if (error) setError('');
                                            }}
                                            className={`w-full bg-bg-primary border border-bg-tertiary rounded-md p-3 focus:ring-2 focus:ring-accent-primary focus:border-accent-primary disabled:opacity-50 resize-none ${
                                                error ? 'border-red-500' : ''
                                            }`}
                                            rows={4}
                                            placeholder="e.g., We need to implement user authentication for our web app with login, registration, and password reset functionality..."
                                            disabled={isGenerating}
                                        />
                                        {error && (
                                            <p className="text-red-400 text-xs mt-1">{error}</p>
                                        )}
                                        <p className="text-xs text-text-placeholder mt-1">
                                            {userDescription.length}/1000 characters
                                        </p>
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                                            disabled={isGenerating}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!userDescription.trim() || isGenerating}
                                            className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                                                userDescription.trim() && !isGenerating
                                                    ? 'bg-accent-primary hover:bg-accent-hover text-text-primary'
                                                    : 'bg-gray-600 cursor-not-allowed text-text-secondary'
                                            }`}
                                        >
                                            {isGenerating ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Generating...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <HiSparkles className="w-4 h-4" />
                                                    Generate & Open Form
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AITaskCreationModal; 