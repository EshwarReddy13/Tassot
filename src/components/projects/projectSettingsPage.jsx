import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useProjects } from '../../contexts/ProjectContext';
import { useUser } from '../../contexts/UserContext';
import toast from 'react-hot-toast';
import AISettingsForm from './widgets/aiSettingsForm';
import ProjectDetailsForm from './widgets/ProjectDetailsForm';

const ProjectSettingsPage = () => {
    const { projectUrl } = useParams();
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

    useEffect(() => {
        if (projectUrl) {
            getProjectSettings(projectUrl);
            
            if (!currentProject || currentProject.project.project_url !== projectUrl) {
                getProjectDetails(projectUrl);
            }
        }
    }, [projectUrl, getProjectSettings, getProjectDetails, currentProject]);

    const isOwner = useMemo(() => {
        // Guard against missing data
        if (!currentProject || !userData || !currentProject.members) return false;
        
        const currentUserMembership = currentProject.members.find(
            (member) => member.id === userData.id 
        );
        // -----------------

        return currentUserMembership?.role === 'owner';
    }, [currentProject, userData]);

    const handleSaveAISettings = async (newSettings) => {
        try {
            await updateProjectSettings(projectUrl, newSettings);
            toast.success('AI Settings saved successfully!');
        } catch (error) {
            console.error("Failed to save AI settings:", error);
            toast.error(error.message || "Failed to save AI settings.");
        }
    };

    const handleSaveProjectDetails = async (projectDetails) => {
        try {
            await updateProjectDetails(projectUrl, projectDetails);
            toast.success('Project details saved successfully!');
        } catch (error) {
            console.error("Failed to save project details:", error);
            toast.error(error.message || "Failed to save project details.");
        }
    };
    
    if (isSettingsLoading || loadingDetails) {
        return <div className="p-8 text-text-primary">Loading Settings...</div>;
    }

    if (settingsError) {
        return <div className="p-8 text-error">Error: {settingsError}</div>;
    }

    if (!projectSettings || !currentProject) {
        return <div className="p-8 text-text-secondary">No settings found for this project.</div>;
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 text-text-primary">
            <h1 className="text-2xl font-bold mb-4">Project Settings</h1>
            <p className="text-text-secondary mb-8">
                Manage your project details and AI generation settings for "{currentProject?.project.project_name}".
            </p>

            {/* Project Details Section */}
            <div className="mb-8">
                <ProjectDetailsForm
                    project={currentProject.project}
                    settings={projectSettings}
                    onSave={handleSaveProjectDetails}
                    isOwner={isOwner}
                />
            </div>

            {/* AI Settings Section */}
            <div className="mt-12">
                <h2 className="text-xl font-bold mb-4">AI Generation Settings</h2>
                <p className="text-text-secondary mb-6">
                    Customize how AI generates content for this project.
                </p>

                <AISettingsForm
                    initialSettings={projectSettings}
                    onSave={handleSaveAISettings}
                    isOwner={isOwner}
                />
            </div>
        </div>
    );
};

export default ProjectSettingsPage;