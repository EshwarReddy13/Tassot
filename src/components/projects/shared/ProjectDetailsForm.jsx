import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import isEqual from 'lodash.isequal';

const ProjectDetailsForm = ({ project, settings, onSave, isOwner }) => {
    const [formData, setFormData] = useState({
        projectName: '',
        projectKey: '',
        description: '',
        projectType: '',
        currentPhase: '',
        teamSize: '',
        complexityLevel: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // Initialize form data when project or settings change
    useEffect(() => {
        if (project && settings) {
            setFormData({
                projectName: project.project_name || '',
                projectKey: project.project_key || '',
                description: project.description || '',
                projectType: settings.project_details?.project_type || '',
                currentPhase: settings.project_details?.current_phase || '',
                teamSize: settings.project_details?.team_size?.toString() || '',
                complexityLevel: settings.project_details?.complexity_level || ''
            });
        }
    }, [project, settings]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.projectName.trim()) {
            newErrors.projectName = 'Project name is required';
        }

        if (!formData.projectKey.trim()) {
            newErrors.projectKey = 'Project key is required';
        } else if (!/^[A-Z]{3,4}$/.test(formData.projectKey)) {
            newErrors.projectKey = 'Project key must be 3-4 uppercase letters';
        }

        if (!formData.projectType) {
            newErrors.projectType = 'Project type is required';
        }

        if (!formData.currentPhase) {
            newErrors.currentPhase = 'Current phase is required';
        }

        if (!formData.teamSize || parseInt(formData.teamSize) < 1) {
            newErrors.teamSize = 'Team size must be at least 1';
        }

        if (!formData.complexityLevel) {
            newErrors.complexityLevel = 'Complexity level is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isOwner) {
            toast.error("You don't have permission to save project details.");
            return;
        }

        if (!validateForm()) {
            toast.error("Please fix the errors before saving.");
            return;
        }

        setIsSaving(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error('Failed to save project details:', error);
            toast.error(error.message || 'Failed to save project details.');
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanges = () => {
        if (!project || !settings) return false;
        
        return (
            formData.projectName !== (project.project_name || '') ||
            formData.projectKey !== (project.project_key || '') ||
            formData.description !== (project.description || '') ||
            formData.projectType !== (settings.project_details?.project_type || '') ||
            formData.currentPhase !== (settings.project_details?.current_phase || '') ||
            formData.teamSize !== (settings.project_details?.team_size?.toString() || '') ||
            formData.complexityLevel !== (settings.project_details?.complexity_level || '')
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-bg-card border border-bg-tertiary rounded-lg p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Project Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project Name */}
                    <div>
                        <label htmlFor="project-name" className="block text-sm font-medium text-text-secondary mb-2">
                            Project Name
                        </label>
                        <input
                            id="project-name"
                            type="text"
                            value={formData.projectName}
                            onChange={(e) => handleChange('projectName', e.target.value)}
                            className={`w-full bg-bg-primary border border-bg-tertiary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent-primary focus:border-accent-primary disabled:opacity-50 ${
                                errors.projectName ? 'border-red-500' : ''
                            }`}
                            placeholder="Enter project name"
                            disabled={!isOwner}
                        />
                        {errors.projectName && (
                            <p className="text-red-400 text-xs mt-1">{errors.projectName}</p>
                        )}
                    </div>

                    {/* Project Key */}
                    <div>
                        <label htmlFor="project-key" className="block text-sm font-medium text-text-secondary mb-2">
                            Project Key <span className="text-xs text-gray-400">(3-4 uppercase letters)</span>
                        </label>
                        <input
                            id="project-key"
                            type="text"
                            value={formData.projectKey}
                            onChange={(e) => handleChange('projectKey', e.target.value.toUpperCase())}
                            className={`w-full bg-bg-primary border border-bg-tertiary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent-primary focus:border-accent-primary disabled:opacity-50 ${
                                errors.projectKey ? 'border-red-500' : ''
                            }`}
                            placeholder="E.g., PROJ"
                            maxLength={4}
                            disabled={!isOwner}
                        />
                        {errors.projectKey && (
                            <p className="text-red-400 text-xs mt-1">{errors.projectKey}</p>
                        )}
                    </div>

                    {/* Project Description */}
                    <div className="md:col-span-2">
                        <label htmlFor="project-description" className="block text-sm font-medium text-text-secondary mb-2">
                            Project Description <span className="text-xs text-gray-400">(Optional)</span>
                        </label>
                        <textarea
                            id="project-description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="w-full bg-bg-primary border border-bg-tertiary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent-primary focus:border-accent-primary disabled:opacity-50 resize-none"
                            rows={3}
                            placeholder="Describe your project goals, objectives, and key deliverables..."
                            disabled={!isOwner}
                        />
                    </div>

                    {/* Project Type */}
                    <div>
                        <label htmlFor="project-type" className="block text-sm font-medium text-text-secondary mb-2">
                            Project Type
                        </label>
                        <select
                            id="project-type"
                            value={formData.projectType}
                            onChange={(e) => handleChange('projectType', e.target.value)}
                            className={`w-full bg-bg-primary border border-bg-tertiary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent-primary focus:border-accent-primary disabled:opacity-50 ${
                                errors.projectType ? 'border-red-500' : ''
                            }`}
                            disabled={!isOwner}
                        >
                            <option value="">Select project type</option>
                            <option value="Software Development">Software Development</option>
                            <option value="Marketing Campaign">Marketing Campaign</option>
                            <option value="Event Planning">Event Planning</option>
                            <option value="Product Launch">Product Launch</option>
                            <option value="Research Project">Research Project</option>
                            <option value="Content Creation">Content Creation</option>
                            <option value="Design Project">Design Project</option>
                            <option value="Business Strategy">Business Strategy</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.projectType && (
                            <p className="text-red-400 text-xs mt-1">{errors.projectType}</p>
                        )}
                    </div>

                    {/* Current Phase */}
                    <div>
                        <label htmlFor="current-phase" className="block text-sm font-medium text-text-secondary mb-2">
                            Current Project Phase
                        </label>
                        <select
                            id="current-phase"
                            value={formData.currentPhase}
                            onChange={(e) => handleChange('currentPhase', e.target.value)}
                            className={`w-full bg-bg-primary border border-bg-tertiary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent-primary focus:border-accent-primary disabled:opacity-50 ${
                                errors.currentPhase ? 'border-red-500' : ''
                            }`}
                            disabled={!isOwner}
                        >
                            <option value="">Select current phase</option>
                            <option value="Planning">Planning</option>
                            <option value="Development">Development</option>
                            <option value="Testing">Testing</option>
                            <option value="Launch">Launch</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Review">Review</option>
                        </select>
                        {errors.currentPhase && (
                            <p className="text-red-400 text-xs mt-1">{errors.currentPhase}</p>
                        )}
                    </div>

                    {/* Team Size */}
                    <div>
                        <label htmlFor="team-size" className="block text-sm font-medium text-text-secondary mb-2">
                            Team Size
                        </label>
                        <input
                            id="team-size"
                            type="number"
                            min="1"
                            value={formData.teamSize}
                            onChange={(e) => handleChange('teamSize', e.target.value)}
                            className={`w-full bg-bg-primary border border-bg-tertiary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent-primary focus:border-accent-primary disabled:opacity-50 ${
                                errors.teamSize ? 'border-red-500' : ''
                            }`}
                            placeholder="Enter team size"
                            disabled={!isOwner}
                        />
                        {errors.teamSize && (
                            <p className="text-red-400 text-xs mt-1">{errors.teamSize}</p>
                        )}
                    </div>

                    {/* Complexity Level */}
                    <div>
                        <label htmlFor="complexity-level" className="block text-sm font-medium text-text-secondary mb-2">
                            Project Complexity Level
                        </label>
                        <select
                            id="complexity-level"
                            value={formData.complexityLevel}
                            onChange={(e) => handleChange('complexityLevel', e.target.value)}
                            className={`w-full bg-bg-primary border border-bg-tertiary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent-primary focus:border-accent-primary disabled:opacity-50 ${
                                errors.complexityLevel ? 'border-red-500' : ''
                            }`}
                            disabled={!isOwner}
                        >
                            <option value="">Select complexity level</option>
                            <option value="Simple">Simple</option>
                            <option value="Medium">Medium</option>
                            <option value="Complex">Complex</option>
                        </select>
                        {errors.complexityLevel && (
                            <p className="text-red-400 text-xs mt-1">{errors.complexityLevel}</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <motion.button
                        type="submit"
                        disabled={!isOwner || isSaving || !hasChanges()}
                        className={`px-6 py-2 rounded-md font-semibold text-text-primary transition-colors duration-200 ${
                            isOwner && hasChanges() && !isSaving
                                ? 'bg-accent-primary hover:bg-accent-hover'
                                : 'bg-gray-600 cursor-not-allowed'
                        } ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                </div>
                
                {!isOwner && (
                    <p className="text-right text-sm text-yellow-400 mt-2">
                        Only the project owner can save changes.
                    </p>
                )}
            </div>
        </form>
    );
};

export default ProjectDetailsForm; 