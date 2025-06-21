import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useProjects } from '../../contexts/ProjectContext';
import { useUser } from '../../contexts/UserContext';
import toast from 'react-hot-toast';
import AISettingsForm from './widgets/aiSettingsForm';

const ProjectSettingsPage = () => {
    const { projectUrl } = useParams();
    const { 
        currentProject, 
        projectSettings, 
        getProjectSettings,
        updateProjectSettings, 
        isSettingsLoading, 
        settingsError 
    } = useProjects();
    const { userData } = useUser();

    useEffect(() => {
        if (projectUrl) {
            getProjectSettings(projectUrl);
        }
    }, [projectUrl, getProjectSettings]);

    const isOwner = useMemo(() => {
        if (!currentProject || !userData) return false;
        const currentUserMembership = currentProject.members.find(
            (member) => member.firebase_uid === userData.firebase_uid
        );
        return currentUserMembership?.role === 'owner';
    }, [currentProject, userData]);

    const handleSave = async (newSettings) => {
        try {
            await updateProjectSettings(projectUrl, newSettings);
            toast.success('AI Settings saved successfully!');
        } catch (error) {
            console.error("Failed to save settings:", error);
            toast.error(error.message || "Failed to save settings.");
        }
    };
    
    if (isSettingsLoading) {
        return <div className="p-8 text-text-primary">Loading AI Settings...</div>;
    }

    if (settingsError) {
        return <div className="p-8 text-error">Error: {settingsError}</div>;
    }

    if (!projectSettings) {
        return <div className="p-8 text-text-secondary">No settings found.</div>;
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 text-text-primary">
            <h1 className="text-2xl font-bold mb-4">AI Generation Settings</h1>
            <p className="text-text-secondary mb-8">
                Customize how AI generates content for this project. These settings only apply to "{currentProject?.project_name}".
            </p>

            <AISettingsForm
                initialSettings={projectSettings}
                onSave={handleSave}
                isOwner={isOwner}
            />
        </div>
    );
};

export default ProjectSettingsPage;