import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { HiSave, HiLockClosed, HiSparkles, HiCog, HiLightningBolt, HiDocumentText, HiCheckCircle } from 'react-icons/hi';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import isEqual from 'lodash.isequal';

const presets = {
  balanced: {
    general: { tone: 'professional', style: 'goal-oriented', formality: 'semi-formal', person: 'third-person', language_style: 'en-US' },
    task_name: { length: 'medium', verb_style: 'imperative', punctuation_style: 'title_case' },
    task_description: { depth: 'moderate', structure_type: 'standard', content_elements: ['main_heading', 'sub_heading', 'sentences', 'bullet_points'], clarity_level: 'mixed', match_general_settings: true, task_description_tone: 'neutral', task_description_style: 'descriptive', task_description_clarity_level_override: 'mixed', task_description_verb_style_override: 'descriptive' },
    special_notes: "",
  },
  creative: {
    general: { tone: 'motivational', style: 'descriptive', formality: 'casual', person: 'second-person', language_style: 'en-US' },
    task_name: { length: 'long', verb_style: 'descriptive', punctuation_style: 'title_case' },
    task_description: { depth: 'detailed', structure_type: 'hierarchical', content_elements: ['main_heading', 'sub_heading', 'sentences', 'bullet_points', 'emojis'], clarity_level: 'layman', match_general_settings: false, task_description_tone: 'empathetic', task_description_style: 'descriptive', task_description_clarity_level_override: 'mixed', task_description_verb_style_override: 'descriptive' },
    special_notes: "Focus on why this task is important for the big picture.",
  },
  technical: {
    general: { tone: 'professional', style: 'concise', formality: 'formal', person: 'third-person', language_style: 'en-US' },
    task_name: { length: 'short', verb_style: 'imperative', punctuation_style: 'sentence_case' },
    task_description: { depth: 'detailed', structure_type: 'numbered', content_elements: ['main_heading', 'numbered_points', 'stylistic_punctuation'], clarity_level: 'technical', match_general_settings: true, task_description_tone: 'neutral', task_description_style: 'descriptive', task_description_clarity_level_override: 'mixed', task_description_verb_style_override: 'descriptive' },
    special_notes: "Be specific and use technical terms where appropriate. Avoid ambiguity.",
  }
};

const FormSection = ({ title, description, children, icon: Icon = HiCog }) => (
    <motion.div 
        className="glass-settings p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 glass-dark rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
                <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
                {description && <p className="text-text-secondary text-sm">{description}</p>}
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children}
        </div>
    </motion.div>
);

const SelectField = ({ label, value, onChange, children, disabled }) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-text-secondary">{label}</label>
        <select 
            value={value} 
            onChange={onChange} 
            disabled={disabled} 
            className="glass-settings-input"
        >
            {children}
        </select>
    </div>
);

const TextareaField = ({ label, value, onChange, name, placeholder, disabled }) => (
     <div className="md:col-span-2 space-y-2">
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary">{label}</label>
        <textarea 
            id={name} 
            name={name} 
            value={value} 
            onChange={onChange} 
            disabled={disabled} 
            rows={4} 
            placeholder={placeholder} 
            className="glass-settings-input resize-none" 
        />
    </div>
);

const CheckboxField = ({ label, checked, onChange, disabled, id, value }) => (
    <div className="flex items-center space-x-3 p-3 glass-settings-input">
        <input 
            type="checkbox" 
            id={id} 
            checked={checked} 
            onChange={onChange} 
            value={value}
            disabled={disabled} 
            className="h-4 w-4 rounded border-white/20 text-accent-primary focus:ring-accent-primary focus:ring-2 disabled:opacity-50"
        />
        <label htmlFor={id} className="block text-sm text-text-secondary font-medium">{label}</label>
    </div>
);

const AISettingsForm = ({ initialSettings, onSave, isOwner }) => {
    const contentElementOptions = ['main_heading', 'sub_heading', 'sentences', 'bullet_points', 'numbered_points', 'emojis', 'stylistic_punctuation'];
    const [settings, setSettings] = useState(initialSettings);
    const [initialData, setInitialData] = useState(initialSettings);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        setSettings(initialSettings);
        setInitialData(initialSettings);
    }, [initialSettings]);
    
    const hasChanges = !isEqual(initialData, settings);

    const handleChange = (section, field, value) => {
      const isRootField = section === null;
      setSettings(prev => ({
            ...prev,
            ai_preferences: isRootField ? {
              ...prev.ai_preferences,
              [field]: value,
              selected_preset: 'custom',
            } : {
              ...prev.ai_preferences,
              [section]: {
                    ...prev.ai_preferences[section],
                    [field]: value
              },
              selected_preset: 'custom',
            }
        }));
    };

    const handlePresetChange = (e) => {
        const presetName = e.target.value;
        if (presetName === 'custom') return;
        setSettings(prev => ({
            ...prev,
            ai_preferences: {
                ...presets[presetName],
                selected_preset: presetName, 
                task_description: {
                    ...presets[presetName].task_description,
                    task_description_clarity_level_override: initialSettings.ai_preferences.task_description.task_description_clarity_level_override,
                    task_description_verb_style_override: initialSettings.ai_preferences.task_description.task_description_verb_style_override
                }
            }
        }));
    };

    const handleContentElementChange = (e) => {
        const { value, checked } = e.target;
        const currentElements = settings.ai_preferences.task_description.content_elements || [];
        const newElements = checked
            ? [...currentElements, value]
            : currentElements.filter(el => el !== value);
        handleChange('task_description', 'content_elements', newElements);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isOwner) {
            toast.error("You don't have permission to save settings.");
            return;
        }
        setIsSaving(true);
        try {
            await onSave(settings);
            setInitialData(settings); // Reset initial state after save
        } catch (error) {
            console.error('Failed to save AI settings:', error);
            toast.error(error.message || 'Failed to save AI settings.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <FormSection 
                title="AI Presets" 
                description="Start with a predefined configuration to quickly set up your AI preferences."
                icon={HiLightningBolt}
            >
                <div className="md:col-span-2">
                    <SelectField 
                        label="Load a Preset" 
                        value={settings.ai_preferences.selected_preset} 
                        onChange={handlePresetChange} 
                        disabled={!isOwner}
                    >
                        <option value="balanced">⚖️ Balanced - Professional & Goal-Oriented</option>
                        <option value="creative">🎨 Creative - Motivational & Descriptive</option>
                        <option value="technical">🔧 Technical - Concise & Formal</option>
                        <option value="custom">⚙️ Custom (current settings)</option>
                    </SelectField>
                </div>
            </FormSection>

            <FormSection 
                title="General Settings" 
                description="Overall tone and style for AI content."
                icon={HiCog}
            >
                <SelectField label="Tone" value={settings.ai_preferences.general.tone} onChange={(e) => handleChange('general', 'tone', e.target.value)} disabled={!isOwner}>
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="neutral">Neutral</option>
                    <option value="motivational">Motivational</option>
                    <option value="empathetic">Empathetic</option>
                </SelectField>
                <SelectField label="Style" value={settings.ai_preferences.general.style} onChange={(e) => handleChange('general', 'style', e.target.value)} disabled={!isOwner}>
                    <option value="goal-oriented">Goal-Oriented</option>
                    <option value="concise">Concise</option>
                    <option value="descriptive">Descriptive</option>
                    <option value="conversational">Conversational</option>
                    <option value="instructional">Instructional</option>
                </SelectField>
                <SelectField label="Formality" value={settings.ai_preferences.general.formality} onChange={(e) => handleChange('general', 'formality', e.target.value)} disabled={!isOwner}>
                    <option value="formal">Formal</option>
                    <option value="semi-formal">Semi-formal</option>
                    <option value="casual">Casual</option>
                </SelectField>
                <SelectField label="Person" value={settings.ai_preferences.general.person} onChange={(e) => handleChange('general', 'person', e.target.value)} disabled={!isOwner}>
                    <option value="first-person">First-person</option>
                    <option value="second-person">Second-person</option>
                    <option value="third-person">Third-person</option>
                </SelectField>
                <SelectField label="Language Style" value={settings.ai_preferences.general.language_style} onChange={(e) => handleChange('general', 'language_style', e.target.value)} disabled={!isOwner}>
                    <option value="en-US">English (US)</option>
                    <option value="en-UK">English (UK)</option>
                    <option value="es-ES">Spanish</option>
                    <option value="fr-FR">French</option>
                </SelectField>
            </FormSection>
            
            <FormSection 
                title="Task Name Generation" 
                description="Rules for generating task names."
                icon={HiDocumentText}
            >
                 <SelectField label="Length" value={settings.ai_preferences.task_name.length} onChange={(e) => handleChange('task_name', 'length', e.target.value)} disabled={!isOwner}>
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long</option>
                </SelectField>
                <SelectField label="Verb Style" value={settings.ai_preferences.task_name.verb_style} onChange={(e) => handleChange('task_name', 'verb_style', e.target.value)} disabled={!isOwner}>
                    <option value="imperative">Imperative (e.g., 'Create')</option>
                    <option value="descriptive">Descriptive (e.g., 'Creating')</option>
                </SelectField>
                 <SelectField label="Punctuation" value={settings.ai_preferences.task_name.punctuation_style} onChange={(e) => handleChange('task_name', 'punctuation_style', e.target.value)} disabled={!isOwner}>
                    <option value="title_case">Title Case</option>
                    <option value="sentence_case">Sentence case</option>
                </SelectField>
            </FormSection>

            <FormSection 
                title="Task Description Generation" 
                description="Rules for generating detailed task descriptions."
                icon={HiSparkles}
            >
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
                <SelectField label="Structure Type" value={settings.ai_preferences.task_description.structure_type} onChange={(e) => handleChange('task_description', 'structure_type', e.target.value)} disabled={!isOwner}>
                    <option value="standard">Standard</option>
                    <option value="bulleted">Bulleted</option>
                    <option value="numbered">Numbered</option>
                    <option value="hierarchical">Hierarchical</option>
                </SelectField>
                 
                <div className="md:col-span-2 space-y-4">
                    <label className="block text-sm font-medium text-text-secondary">Content Elements</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                       {contentElementOptions.map(option => (
                           <CheckboxField
                               key={option}
                               id={`content-el-${option}`}
                               label={option.replace(/_/g, ' ')}
                               checked={settings.ai_preferences.task_description.content_elements?.includes(option)}
                               onChange={handleContentElementChange}
                               value={option}
                               disabled={!isOwner}
                           />
                       ))}
                    </div>
                </div>

                <div className="md:col-span-2">
                  <CheckboxField 
                      label="Inherit Tone & Style from General Settings" 
                      id="match-general-settings" 
                      checked={settings.ai_preferences.task_description.match_general_settings} 
                      onChange={(e) => handleChange('task_description', 'match_general_settings', e.target.checked)} 
                      disabled={!isOwner} 
                  />
                </div>

                {!settings.ai_preferences.task_description.match_general_settings && (
                     <>
                        <SelectField label="Description-Specific Tone" value={settings.ai_preferences.task_description.task_description_tone} onChange={(e) => handleChange('task_description', 'task_description_tone', e.target.value)} disabled={!isOwner}>
                            <option value="neutral">Neutral</option>
                            <option value="professional">Professional</option>
                            <option value="friendly">Friendly</option>
                            <option value="motivational">Motivational</option>
                            <option value="empathetic">Empathetic</option>
                        </SelectField>
                        
                        <SelectField label="Description-Specific Style" value={settings.ai_preferences.task_description.task_description_style} onChange={(e) => handleChange('task_description', 'task_description_style', e.target.value)} disabled={!isOwner}>
                            <option value="descriptive">Descriptive</option>
                            <option value="concise">Concise</option>
                            <option value="instructional">Instructional</option>
                        </SelectField>
                        
                        <SelectField label="Clarity Override" value={settings.ai_preferences.task_description.task_description_clarity_level_override} onChange={(e) => handleChange('task_description', 'task_description_clarity_level_override', e.target.value)} disabled={!isOwner}>
                           <option value="mixed">Mixed</option>
                           <option value="layman">Layman</option>
                           <option value="technical">Technical</option>
                        </SelectField>
                        
                        <SelectField label="Verb Style Override" value={settings.ai_preferences.task_description.task_description_verb_style_override} onChange={(e) => handleChange('task_description', 'task_description_verb_style_override', e.target.value)} disabled={!isOwner}>
                           <option value="descriptive">Descriptive</option>
                           <option value="imperative">Imperative</option>
                        </SelectField>
                     </>
                )}

                <TextareaField 
                    label="Special Notes / Instructions" 
                    name="special_notes" 
                    value={settings.ai_preferences.special_notes} 
                    onChange={(e) => handleChange(null, 'special_notes', e.target.value)}
                    placeholder="e.g., Always include a one-sentence summary at the top."
                    disabled={!isOwner}
                />
            </FormSection>

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
                        isOwner && hasChanges && !isSaving
                            ? 'glass-button-accent hover:scale-105'
                            : 'glass-button opacity-50 cursor-not-allowed'
                    } ${isSaving ? 'cursor-wait' : ''}`}
                    whileHover={isOwner && hasChanges && !isSaving ? { scale: 1.02 } : {}}
                    whileTap={isOwner && hasChanges && !isSaving ? { scale: 0.98 } : {}}
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

export default memo(AISettingsForm);