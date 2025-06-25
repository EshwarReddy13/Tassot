import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiUserCircle, HiCalendar, HiViewGrid, HiSparkles } from 'react-icons/hi';
import { useUser } from '../../../contexts/UserContext';
import { useAI } from '../../../contexts/AIContext.jsx';
import Select from 'react-select';
import AIEnhancedInput from './AIEnhancedInput.jsx';

const FormatOptionLabel = ({ id, photo_url, first_name, last_name, email }) => (
    <div className="flex items-center">
        <img
            src={photo_url || `https://ui-avatars.com/api/?name=${first_name}+${last_name}&background=3a3a44&color=fff`}
            alt={`${first_name} ${last_name}`}
            className="w-8 h-8 rounded-full mr-3 object-cover"
        />
        <div>
            <div className="font-semibold text-text-primary">{first_name} {last_name}</div>
            <div className="text-sm text-text-secondary">{email}</div>
        </div>
    </div>
);

const selectStyles = {
    control: (provided) => ({
        ...provided,
        backgroundColor: 'var(--color-bg-primary)',
        borderColor: 'transparent',
        boxShadow: 'none',
        '&:hover': { borderColor: 'var(--color-accent-primary)' },
        minHeight: '44px',
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? 'var(--color-accent-primary)' : state.isFocused ? 'var(--color-bg-card)' : 'var(--color-bg-secondary)',
        color: 'var(--color-text-primary)',
        '&:active': { backgroundColor: 'var(--color-accent-hover)' },
    }),
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: 'var(--color-accent-primary)',
        color: 'white',
        borderRadius: '0.25rem',
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: 'white',
        fontWeight: '500'
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        color: 'white',
        '&:hover': {
            backgroundColor: 'var(--color-accent-hover)',
            color: 'white',
        },
    }),
    menu: (provided) => ({ ...provided, backgroundColor: 'var(--color-bg-secondary)', zIndex: 100 }),
    input: (styles) => ({ ...styles, color: 'var(--color-text-primary)' }),
    placeholder: (styles) => ({ ...styles, color: 'var(--color-text-placeholder)' }),
    singleValue: (styles) => ({ ...styles, color: 'var(--color-text-primary)' }),
};

const AddTaskModal = ({ isOpen, onClose, onSubmit, members = [], boards = [], initialBoardId, prefillData = null }) => {
    const { userData } = useUser();
    const { enhanceTaskName, enhanceTaskDescription } = useAI();
    const { projectUrl } = useParams();

    const getInitialState = () => ({
        task_name: '',
        description: '',
        deadline: '',
        board_id: initialBoardId || (boards[0] ? boards[0].id : ''),
        assignees: [],
    });
    
    const [taskData, setTaskData] = useState(getInitialState());
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (prefillData) {
                // Pre-fill with AI-generated content
                const deadline = prefillData.deadline ? new Date(prefillData.deadline).toISOString().split('T')[0] : '';
                setTaskData({
                    task_name: prefillData.taskName || '',
                    description: prefillData.description || '',
                    deadline: deadline,
                    board_id: initialBoardId || (boards[0] ? boards[0].id : ''),
                    assignees: [],
                });
            } else {
                // Reset to initial state
                setTaskData(prev => ({ ...getInitialState(), board_id: initialBoardId || prev.board_id }));
            }
            setError('');
        }
    }, [isOpen, initialBoardId, prefillData, boards]);

    const handleEnhanceName = useCallback((text) => {
        return enhanceTaskName(text, projectUrl);
    }, [enhanceTaskName, projectUrl]);

    const handleEnhanceDescription = useCallback((text) => {
        return enhanceTaskDescription(text, taskData.task_name, projectUrl);
    }, [enhanceTaskDescription, projectUrl, taskData.task_name]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTaskData(prev => ({ ...prev, [name]: value }));
    };

    const handleAssigneeChange = (selectedOptions) => {
        setTaskData(prev => ({ ...prev, assignees: selectedOptions || [] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!taskData.task_name.trim()) {
            setError('Task name is required.');
            return;
        }
        if (!taskData.board_id) {
            setError('A board must be selected.');
            return;
        }
        const payload = {
            ...taskData,
            assigneeIds: taskData.assignees.map(a => a.value),
        };
        delete payload.assignees;
        onSubmit(payload);
        onClose();
    };

    const memberOptions = members.map(m => ({ value: m.id, label: `${m.first_name} ${m.last_name}`, ...m }));

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-bg-dark bg-opacity-70 flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="add-task-modal-title"
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
                                <h2 id="add-task-modal-title" className="text-lg font-bold text-text-primary">
                                    {prefillData ? 'Review & Create Task (AI Generated)' : 'Create New Task'}
                                </h2>
                                {prefillData && (
                                    <div className="flex items-center gap-2 px-2 py-1 bg-accent-primary bg-opacity-20 rounded-full">
                                        <HiSparkles className="w-4 h-4 text-accent-primary" />
                                        <span className="text-xs font-medium text-accent-primary">AI Generated</span>
                                    </div>
                                )}
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full text-text-secondary hover:bg-bg-primary">
                                <HiX className="w-6 h-6" />
                            </button>
                        </header>
                        
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                             <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Created By</label>
                                {userData && <FormatOptionLabel {...userData} />}
                             </div>

                             <div>
                                <label htmlFor="task_name" className="block text-sm font-medium text-text-primary mb-2">
                                    Task Name <span className="text-error">*</span>
                                </label>
                                <AIEnhancedInput
                                    name="task_name"
                                    value={taskData.task_name}
                                    onChange={handleChange}
                                    placeholder="e.g., Design the new user dashboard"
                                    onEnhance={handleEnhanceName}
                                />
                                {error && taskData.task_name.trim() === '' && <p className="text-error text-sm mt-1">{error}</p>}
                            </div>

                             <div>
                                <label htmlFor="board_id" className="text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
                                  <HiViewGrid className="w-5 h-5 text-text-secondary" />  Board / Status
                                </label>
                                <select
                                    id="board_id"
                                    name="board_id"
                                    value={taskData.board_id}
                                    onChange={handleChange}
                                    className="w-full bg-bg-primary text-text-primary p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
                                >
                                    {boards.map(board => <option key={board.id} value={board.id}>{board.name}</option>)}
                                </select>
                            </div>

                             <div>
                                <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">Description</label>
                                <AIEnhancedInput
                                    name="description"
                                    value={taskData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Add details, links, checklists..."
                                    onEnhance={handleEnhanceDescription}
                                />
                            </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
                                        <HiUserCircle className="w-5 h-5 text-text-secondary" /> Assign To
                                    </label>
                                    <Select
                                        isMulti
                                        name="assignees"
                                        options={memberOptions}
                                        value={taskData.assignees}
                                        onChange={handleAssigneeChange}
                                        formatOptionLabel={FormatOptionLabel}
                                        styles={selectStyles}
                                        placeholder="Select team members..."
                                        getOptionValue={option => option.id}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="deadline" className="text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
                                        <HiCalendar className="w-5 h-5 text-text-secondary" /> Deadline
                                    </label>
                                    <input
                                        type="date"
                                        id="deadline"
                                        name="deadline"
                                        value={taskData.deadline}
                                        onChange={handleChange}
                                        className="w-full bg-bg-primary text-text-primary p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
                                    />
                                </div>
                            </div>
                        </form>

                        <footer className="flex items-center justify-end p-4 border-t border-bg-primary gap-3 mt-auto">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-text-secondary hover:bg-bg-primary">Cancel</button>
                            <button type="submit" onClick={handleSubmit} className="px-6 py-2 rounded-md bg-accent-primary font-semibold text-text-primary hover:bg-accent-hover">
                                {prefillData ? 'Create Task' : 'Create Task'}
                            </button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddTaskModal;