import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useProjects } from '../../../contexts/ProjectContext';
import { useUser } from '../../../contexts/UserContext';
import { 
    HiCog, 
    HiSparkles, 
    HiInformationCircle, 
    HiCheckCircle,
    HiExclamation,
    HiArrowRight,
    HiShieldCheck,
    HiUserGroup,
    HiDocumentText,
    HiLightningBolt,
    HiX,
    HiSave
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import AISettingsForm from './AISettingsForm';
import ProjectDetailsForm from './ProjectDetailsForm';

const ProjectSettingsPage = () => {
    const { projectUrl } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { 
        currentProject, 
        projectSettings, 
        getProjectSettings,
        updateProjectSettings,
        updateProjectDetails,
        isSettingsLoading, 
        settingsError,
        loadingDetails, 
        getProjectDetails
    } = useProjects();
    const { userData } = useUser();

    const [activeTab, setActiveTab] = useState('project');
    const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        if (projectUrl) {
            getProjectSettings(projectUrl);
            
            if (!currentProject || currentProject.project.project_url !== projectUrl) {
                getProjectDetails(projectUrl);
            }
        }
    }, [projectUrl, getProjectSettings, getProjectDetails, currentProject]);

    const isOwner = useMemo(() => {
        if (!currentProject || !userData || !currentProject.members) return false;
        
        const currentUserMembership = currentProject.members.find(
            (member) => member.id === userData.id 
        );

        return currentUserMembership?.role === 'owner';
    }, [currentProject, userData]);

    const handleSaveAISettings = useCallback(async (newSettings) => {
        try {
            await updateProjectSettings(projectUrl, newSettings);
            setSaveStatus({ type: 'success', message: 'AI Settings saved successfully!' });
            setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            console.error("Failed to save AI settings:", error);
            setSaveStatus({ type: 'error', message: error.message || "Failed to save AI settings." });
            setTimeout(() => setSaveStatus({ type: '', message: '' }), 5000);
        }
    }, [projectUrl, updateProjectSettings]);

    const handleSaveProjectDetails = useCallback(async (projectDetails) => {
        try {
            await updateProjectDetails(projectUrl, projectDetails);
            setSaveStatus({ type: 'success', message: 'Project details saved successfully!' });
            setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            console.error("Failed to save project details:", error);
            setSaveStatus({ type: 'error', message: error.message || "Failed to save project details." });
            setTimeout(() => setSaveStatus({ type: '', message: '' }), 5000);
        }
    }, [projectUrl, updateProjectDetails]);

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
    };

    const tabs = [
        {
            id: 'project',
            label: 'Project Details',
            icon: HiDocumentText,
            description: 'Manage project information and metadata'
        },
        {
            id: 'ai',
            label: 'AI Settings',
            icon: HiSparkles,
            description: 'Customize AI generation preferences'
        }
    ];
    
    if (isSettingsLoading || loadingDetails) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="w-16 h-16 mx-auto mb-6 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin"></div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Loading Settings</h2>
                    <p className="text-text-secondary">Preparing your project configuration...</p>
                </motion.div>
            </div>
        );
    }

    if (settingsError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <motion.div 
                    className="glass-card p-8 text-center max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <HiExclamation className="w-16 h-16 text-error mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Settings Error</h2>
                    <p className="text-text-secondary mb-6">{settingsError}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="glass-button-accent px-6 py-3 rounded-lg"
                    >
                        Try Again
                    </button>
                </motion.div>
            </div>
        );
    }

    if (!projectSettings || !currentProject) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <motion.div 
                    className="glass-card p-8 text-center max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <HiInformationCircle className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-text-primary mb-2">No Settings Found</h2>
                    <p className="text-text-secondary">Settings for this project could not be loaded.</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4">
            <div className="max-w mx-auto">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div>
                            <p className="text-text-secondary mt-1">
                                Configure "{currentProject?.project.project_name}" settings and preferences
                            </p>
                        </div>
                    </div>
                    
                    {/* Project Info Card */}
                    <motion.div 
                        className="glass-dark rounded-md border-2 border-white/40 p-6 mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-primary to-accent-hover flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">
                                        {currentProject?.project.project_name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-text-primary">
                                        {currentProject?.project.project_name}
                                    </h3>
                                    <p className="text-text-secondary">
                                        Project Key: <span className="font-mono text-accent-primary">{currentProject?.project.project_key}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <HiShieldCheck className="w-5 h-5 text-accent-primary" />
                                <span className="text-sm text-text-secondary">
                                    {isOwner ? 'Owner' : 'Member'} Access
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Status Messages */}
                <AnimatePresence>
                    {saveStatus.message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                                saveStatus.type === 'success' 
                                    ? 'bg-success/10 border border-success/20' 
                                    : 'bg-error/10 border border-error/20'
                            }`}
                        >
                            {saveStatus.type === 'success' ? (
                                <HiCheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                            ) : (
                                <HiExclamation className="w-5 h-5 text-error flex-shrink-0" />
                            )}
                            <p className={`font-medium ${
                                saveStatus.type === 'success' ? 'text-success' : 'text-error'
                            }`}>
                                {saveStatus.message}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tab Navigation */}
                <motion.div 
                    className="mb-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex gap-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex-1 flex items-center gap-3 p-4 rounded-t-lg transition-all duration-300 border-t border-l border-r border-white/20 ${
                                    activeTab === tab.id
                                        ? 'glass-settings-no-border text-text-primary'
                                        : 'glass-settings text-text-secondary hover:text-text-primary'
                                }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-semibold">{tab.label}</div>
                                    <div className="text-xs opacity-75">{tab.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Content Area */}
                <div className="glass-settings-no-border rounded-b-lg border-b border-l border-r border-white/20">
                    {activeTab === 'project' && (
                        <div className="p-8">
                            <ProjectDetailsForm
                                project={currentProject.project}
                                settings={projectSettings}
                                onSave={handleSaveProjectDetails}
                                isOwner={isOwner}
                            />
                        </div>
                    )}

                    {activeTab === 'ai' && (
                        <div className="p-8">
                            <AISettingsForm
                                initialSettings={projectSettings}
                                onSave={handleSaveAISettings}
                                isOwner={isOwner}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectSettingsPage;