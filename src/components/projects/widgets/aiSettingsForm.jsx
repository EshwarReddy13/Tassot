import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import isEqual from 'lodash.isequal'; // You need to run: npm install lodash.isequal

// Define reusable components inside the form file for locality
const FormSection = ({ title, description, children }) => (
    <div className="mb-8 p-6 bg-bg-secondary rounded-lg border border-bg-tertiary">
        <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
        <p className="text-text-secondary text-sm mb-6">{description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {children}
        </div>
    </div>
);

const SelectField = ({ label, value, onChange, children, disabled }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <select
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full bg-bg-card border border-bg-tertiary rounded-md p-2 focus:ring-2 focus:ring-accent-primary focus:border-accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {children}
        </select>
    </div>
);

const CheckboxField = ({ label, checked, onChange, disabled }) => (
    <div className="flex items-center col-span-1 md:col-span-2 mt-2">
        <input
            type="checkbox"
            id={label}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="h-4 w-4 rounded border-bg-tertiary text-accent-primary focus:ring-accent-primary disabled:opacity-50"
        />
        <label htmlFor={label} className="ml-2 block text-sm text-text-secondary">
            {label}
        </label>
    </div>
);


const AISettingsForm = ({ initialSettings, onSave, isOwner }) => {
    const [settings, setSettings] = useState(initialSettings);
    const [isSaving, setIsSaving] = useState(false);
    
    // Resyncs form state if initial settings prop changes (e.g., on re-fetch)
    useEffect(() => {
        setSettings(initialSettings);
    }, [initialSettings]);
    
    const hasChanges = !isEqual(initialSettings, settings);
    
    const handleChange = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            ai_preferences: {
                ...prev.ai_preferences,
                [section]: {
                    ...prev.ai_preferences[section],
                    [field]: value
                }
            }
        }));
    };

    const handleCheckboxChange = (section, field, checked) => {
        handleChange(section, field, checked);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isOwner) {
            toast.error("You don't have permission to save settings.");
            return;
        }
        setIsSaving(true);
        await onSave(settings);
        setIsSaving(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Presets could be added here in the future */}

            <FormSection title="General" description="Overall tone and style for AI content.">
                <SelectField label="Tone" value={settings.ai_preferences.general.tone} onChange={(e) => handleChange('general', 'tone', e.target.value)} disabled={!isOwner}>
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="neutral">Neutral</option>
                    <option value="motivational">Motivational</option>
                </SelectField>
                <SelectField label="Style" value={settings.ai_preferences.general.style} onChange={(e) => handleChange('general', 'style', e.target.value)} disabled={!isOwner}>
                    <option value="goal-oriented">Goal-Oriented</option>
                    <option value="concise">Concise</option>
                    <option value="descriptive">Descriptive</option>
                </SelectField>
            </FormSection>
            
            <FormSection title="Task Name Generation" description="Rules for generating task names.">
                 <SelectField label="Length" value={settings.ai_preferences.task_name.length} onChange={(e) => handleChange('task_name', 'length', e.target.value)} disabled={!isOwner}>
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long</option>
                </SelectField>
                 <SelectField label="Punctuation" value={settings.ai_preferences.task_name.punctuation_style} onChange={(e) => handleChange('task_name', 'punctuation_style', e.target.value)} disabled={!isOwner}>
                    <option value="title_case">Title Case</option>
                    <option value="sentence_case">Sentence case</option>
                </SelectField>
            </FormSection>

            <FormSection title="Task Description Generation" description="Rules for generating detailed task descriptions.">
                 <SelectField label="Depth" value={settings.ai_preferences.task_description.depth} onChange={(e) => handleChange('task_description', 'depth', e.target.value)} disabled={!isOwner}>
                    <option value="brief">Brief</option>
                    <option value="moderate">Moderate</option>
                    <option value="detailed">Detailed</option>
                </SelectField>
                 <SelectField label="Clarity" value={settings.ai_preferences.task_description.clarity_level} onChange={(e) => handleChange('task_description', 'clarity_level', e.target.value)} disabled={!isOwner}>
                    <option value="layman">Layman</option>
                    <option value="technical">Technical</option>
                    <option value="mixed">Mixed</option>
                </SelectField>

                <CheckboxField label="Inherit Tone & Style from General Settings" checked={settings.ai_preferences.task_description.match_tone_and_style_from_title} onChange={(e) => handleCheckboxChange('task_description', 'match_tone_and_style_from_title', e.target.checked)} disabled={!isOwner} />

                {!settings.ai_preferences.task_description.match_tone_and_style_from_title && (
                     <>
                        <SelectField label="Description-Specific Tone" value={settings.ai_preferences.task_description.task_description_tone} onChange={(e) => handleChange('task_description', 'task_description_tone', e.target.value)} disabled={!isOwner}>
                            <option value="neutral">Neutral</option>
                            <option value="professional">Professional</option>
                            <option value="descriptive">Descriptive</option>
                        </SelectField>
                        <SelectField label="Description-Specific Style" value={settings.ai_preferences.task_description.task_description_style} onChange={(e) => handleChange('task_description', 'task_description_style', e.target.value)} disabled={!isOwner}>
                            <option value="descriptive">Descriptive</option>
                            <option value="instructional">Instructional</option>
                            <option value="goal-focused">Goal-Focused</option>
                        </SelectField>
                     </>
                )}
            </FormSection>
            
            <div className="flex justify-end mt-8">
                <button
                    type="submit"
                    disabled={!isOwner || isSaving || !hasChanges}
                    className={clsx(
                        "px-6 py-2 rounded-md font-semibold text-white transition-colors duration-200",
                        {
                            "bg-accent-primary hover:bg-accent-hover": isOwner && hasChanges,
                            "bg-gray-600 cursor-not-allowed": !isOwner || !hasChanges,
                            "bg-gray-500 opacity-70 cursor-wait": isSaving,
                        }
                    )}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
             {!isOwner && <p className="text-right text-sm text-yellow-400 mt-2">Only the project owner can save changes.</p>}
        </form>
    );
};

export default AISettingsForm;