import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { HiSave, HiLockClosed, HiCheckCircle, HiExclamation } from 'react-icons/hi';
import toast from 'react-hot-toast';
import isEqual from 'lodash.isequal';

const FormField = ({ label, children, error, required = false, optional = false }) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-text-secondary">
            {label}
            {required && <span className="text-error ml-1">*</span>}
            {optional && <span className="text-text-tertiary ml-1">(Optional)</span>}
        </label>
        {children}
        {error && (
            <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-error text-sm"
            >
                <HiExclamation className="w-4 h-4 flex-shrink-0" />
                {error}
            </motion.div>
        )}
    </div>
);

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
    const [initialData, setInitialData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (project && settings) {
            const data = {
                projectName: project.project_name || '',
                projectKey: project.project_key || '',
                description: project.description || '',
                projectType: settings.project_details?.project_type || '',
                currentPhase: settings.project_details?.current_phase || '',
                teamSize: settings.project_details?.team_size?.toString() || '',
                complexityLevel: settings.project_details?.complexity_level || ''
            };
            setFormData(data);
            setInitialData(data);
        }
    }, [project, settings]);

    const hasChanges = !isEqual(initialData, formData);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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

        if (!hasChanges) {
            toast.error("No changes to save.");
            return;
        }

        setIsSaving(true);
        try {
            await onSave(formData);
            setInitialData(formData); // Reset initial state after save
        } catch (error) {
            console.error('Failed to save project details:', error);
            toast.error(error.message || 'Failed to save project details.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div 
                className="glass-settings p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h3 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                    <div className="w-8 h-8 glass-dark rounded-lg flex items-center justify-center">
                        <span className="text-accent-primary font-bold text-sm">1</span>
                    </div>
                    Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Project Name" error={errors.projectName} required>
                        <input
                            type="text"
                            value={formData.projectName}
                            onChange={(e) => handleChange('projectName', e.target.value)}
                            className={`glass-settings-input ${errors.projectName ? 'error' : ''}`}
                            placeholder="Enter project name"
                            disabled={!isOwner}
                        />
                    </FormField>

                    <FormField label="Project Key" error={errors.projectKey} required>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.projectKey}
                                onChange={(e) => handleChange('projectKey', e.target.value.toUpperCase())}
                                className={`glass-settings-input font-mono ${errors.projectKey ? 'error' : ''}`}
                                placeholder="PROJ"
                                maxLength={4}
                                disabled={!isOwner}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary text-xs">
                                {formData.projectKey.length}/4
                            </div>
                        </div>
                    </FormField>

                    <div className="md:col-span-2">
                        <FormField label="Project Description" optional>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                className="glass-settings-input resize-none"
                                rows={4}
                                placeholder="Describe your project goals, objectives, and key deliverables..."
                                disabled={!isOwner}
                            />
                        </FormField>
                    </div>
                </div>
            </motion.div>

            <motion.div 
                className="glass-settings p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h3 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                    <div className="w-8 h-8 glass-dark rounded-lg flex items-center justify-center">
                        <span className="text-accent-primary font-bold text-sm">2</span>
                    </div>
                    Project Configuration
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Project Type" error={errors.projectType} required>
                        <select
                            value={formData.projectType}
                            onChange={(e) => handleChange('projectType', e.target.value)}
                            className={`glass-settings-input ${errors.projectType ? 'error' : ''}`}
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
                    </FormField>

                    <FormField label="Current Project Phase" error={errors.currentPhase} required>
                        <select
                            value={formData.currentPhase}
                            onChange={(e) => handleChange('currentPhase', e.target.value)}
                            className={`glass-settings-input ${errors.currentPhase ? 'error' : ''}`}
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
                    </FormField>

                    <FormField label="Team Size" error={errors.teamSize} required>
                        <input
                            type="number"
                            min="1"
                            value={formData.teamSize}
                            onChange={(e) => handleChange('teamSize', e.target.value)}
                            className={`glass-settings-input ${errors.teamSize ? 'error' : ''}`}
                            placeholder="Enter team size"
                            disabled={!isOwner}
                        />
                    </FormField>

                    <FormField label="Project Complexity Level" error={errors.complexityLevel} required>
                        <select
                            value={formData.complexityLevel}
                            onChange={(e) => handleChange('complexityLevel', e.target.value)}
                            className={`glass-settings-input ${errors.complexityLevel ? 'error' : ''}`}
                            disabled={!isOwner}
                        >
                            <option value="">Select complexity level</option>
                            <option value="Simple">Simple</option>
                            <option value="Medium">Medium</option>
                            <option value="Complex">Complex</option>
                        </select>
                    </FormField>
                </div>
            </motion.div>

            <motion.div 
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                {!isOwner && (
                    <div className="flex items-center gap-2 text-warning">
                        <HiLockClosed className="w-5 h-5" />
                        <span className="text-sm">Only the project owner can save changes</span>
                    </div>
                )}
                
                <motion.button
                    type="submit"
                    disabled={!isOwner || isSaving || !hasChanges}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                        isOwner && !isSaving && hasChanges
                            ? 'glass-button-accent hover:scale-105'
                            : 'glass-button opacity-50 cursor-not-allowed'
                    } ${isSaving ? 'cursor-wait' : ''}`}
                    whileHover={isOwner && !isSaving && hasChanges ? { scale: 1.02 } : {}}
                    whileTap={isOwner && !isSaving && hasChanges ? { scale: 0.98 } : {}}
                >
                    {isSaving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <HiSave className="w-5 h-5" />
                            Save Changes
                        </>
                    )}
                </motion.button>
            </motion.div>
        </form>
    );
};

export default memo(ProjectDetailsForm); 