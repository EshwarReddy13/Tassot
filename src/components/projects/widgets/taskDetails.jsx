import { Fragment, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiOutlineNewspaper, HiOutlineCollection, HiOutlineUser, HiOutlineChatAlt2, HiCalendar, HiUserCircle } from 'react-icons/hi';
import CommentList from './commentList';
import Select from 'react-select'; // Import react-select

// Helper to format date for input[type=date] which needs 'YYYY-MM-DD'
const formatToInputDate = (isoString) => {
    if (!isoString) return '';
    // Ensure we handle the date in a way that respects the user's local timezone offset
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- [NEW] Reusable components for React-Select from AddTaskModal ---
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
    control: (p) => ({...p, backgroundColor: 'var(--color-bg-primary)', borderColor: 'transparent', boxShadow: 'none', '&:hover': { borderColor: 'var(--color-accent-primary)' }, minHeight: '44px' }),
    option: (p, s) => ({...p, backgroundColor: s.isSelected ? 'var(--color-accent-primary)' : s.isFocused ? 'var(--color-bg-card)' : 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', '&:active': { backgroundColor: 'var(--color-accent-hover)' }}),
    multiValue: (p) => ({ ...p, backgroundColor: 'var(--color-accent-primary)', color: 'white', borderRadius: '0.25rem' }),
    multiValueLabel: (p) => ({ ...p, color: 'white', fontWeight: '500' }),
    multiValueRemove: (p) => ({ ...p, color: 'white', '&:hover': { backgroundColor: 'var(--color-accent-hover)', color: 'white' }}),
    menu: (p) => ({ ...p, backgroundColor: 'var(--color-bg-secondary)', zIndex: 100 }),
    input: (p) => ({ ...p, color: 'var(--color-text-primary)' }),
    placeholder: (p) => ({ ...p, color: 'var(--color-text-placeholder)' }),
    singleValue: (p) => ({ ...p, color: 'var(--color-text-primary)' }),
};
// --- END of React-Select components ---


const TaskDetailsModal = ({ isOpen, onClose, task, boards, onUpdateTask, creator, members = [] }) => {
    const [updatedTask, setUpdatedTask] = useState(task);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // When the task prop changes, reset the internal state
        // This is crucial for when you open a different task
        setUpdatedTask(task);
    }, [task]);

    // General handler for simple text/date inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedTask(prev => ({ ...prev, [name]: value }));
    };

    // Specific handler for react-select assignees
    const handleAssigneeChange = (selectedOptions) => {
        setUpdatedTask(prev => ({ ...prev, assignees: selectedOptions || [] }));
    };
    
    // Handler for board select
    const handleBoardChange = (e) => {
        const { value } = e.target;
        setUpdatedTask(prev => ({ ...prev, board_id: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Prepare the payload for the API
        const payload = {
            id: updatedTask.id,
            task_name: updatedTask.task_name,
            description: updatedTask.description,
            board_id: updatedTask.board_id,
            deadline: updatedTask.deadline,
            // API expects an array of IDs, not the full user objects
            assigneeIds: updatedTask.assignees.map(a => a.id),
        };
        await onUpdateTask(payload);
        setIsSaving(false);
        onClose(); // Close modal on save
    };

    const hasChanges = JSON.stringify(task) !== JSON.stringify(updatedTask);
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
                    aria-modal="true" role="dialog"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="bg-bg-secondary rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <header className="flex items-center justify-between p-4 border-b border-bg-primary">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-text-secondary bg-bg-primary px-2 py-1 rounded-md">
                                    {task.task_key}
                                </span>
                                <h2 className="text-lg font-bold text-text-primary">{updatedTask.task_name}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full text-text-secondary hover:bg-bg-primary hover:text-white"
                                aria-label="Close task details"
                            >
                                <HiX className="w-6 h-6" />
                            </button>
                        </header>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto flex-grow">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-2 space-y-6">
                                    {/* --- [MODIFIED] Description Section --- */}
                                    <section>
                                        <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                                            <HiOutlineNewspaper className="w-5 h-5 text-text-secondary" />
                                            Description
                                        </h3>
                                        <textarea
                                            name="description" // <-- Changed name from 'notes'
                                            value={updatedTask.description || ''} // <-- Changed from 'notes'
                                            onChange={handleInputChange}
                                            placeholder="Add a more detailed description..."
                                            className="w-full h-48 bg-bg-primary text-text-primary placeholder-text-placeholder p-3 rounded-md border-2 border-transparent focus:border-accent-primary focus:outline-none resize-y"
                                            aria-label="Task description"
                                        />
                                    </section>
                                    
                                    <section>
                                        <h3 className="text-base font-semibold text-text-primary mb-2 flex items-center gap-2">
                                            <HiOutlineChatAlt2 className="w-5 h-5 text-text-secondary" />
                                            Comments
                                        </h3>
                                        <CommentList taskId={task.id} />
                                    </section>
                                </div>

                                <aside className="space-y-6">
                                    <section>
                                        <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                                            <HiOutlineCollection className="w-5 h-5 text-text-secondary" /> Board
                                        </h3>
                                        <select
                                            name="board_id"
                                            value={updatedTask.board_id}
                                            onChange={handleBoardChange}
                                            className="w-full bg-bg-primary text-text-primary p-2.5 rounded-md border-2 border-transparent focus:border-accent-primary focus:outline-none"
                                            aria-label="Change task board"
                                        >
                                            {boards.map(board => (<option key={board.id} value={board.id}>{board.name}</option>))}
                                        </select>
                                    </section>
                                    
                                    {/* --- [NEW] Assignees Section --- */}
                                    <section>
                                        <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                                          <HiUserCircle className="w-5 h-5 text-text-secondary"/>  Assigned To
                                        </h3>
                                        <Select
                                            isMulti
                                            options={memberOptions}
                                            value={updatedTask.assignees ? updatedTask.assignees.map(a => ({...a, value: a.id, label: `${a.first_name} ${a.last_name}`})) : []}
                                            onChange={handleAssigneeChange}
                                            formatOptionLabel={FormatOptionLabel}
                                            styles={selectStyles}
                                            placeholder="Select team members..."
                                        />
                                    </section>
                                    
                                    {/* --- [NEW] Deadline Section --- */}
                                     <section>
                                        <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                                            <HiCalendar className="w-5 h-5 text-text-secondary" /> Deadline
                                        </h3>
                                        <input
                                            type="date"
                                            name="deadline"
                                            value={formatToInputDate(updatedTask.deadline)}
                                            onChange={handleInputChange}
                                            className="w-full bg-bg-primary text-text-primary p-2 rounded-md border-2 border-transparent focus:border-accent-primary focus:outline-none"
                                        />
                                    </section>

                                    <section>
                                        <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                                            <HiOutlineUser className="w-5 h-5 text-text-secondary" /> Created By
                                        </h3>
                                        {creator ? (
                                            <FormatOptionLabel {...creator} />
                                        ) : (
                                            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-bg-primary animate-pulse"></div><div className="space-y-2"><div className="w-24 h-4 bg-bg-primary rounded animate-pulse"></div><div className="w-32 h-3 bg-bg-primary rounded animate-pulse"></div></div></div>
                                        )}
                                    </section>
                                </aside>
                            </div>
                        </div>

                        {/* Footer */}
                        <footer className="flex items-center justify-end p-4 border-t border-bg-primary gap-3">
                            <button onClick={onClose} className="px-4 py-2 rounded-md text-text-secondary hover:bg-bg-primary transition-colors">Cancel</button>
                            <button onClick={handleSave} disabled={!hasChanges || isSaving} className="px-6 py-2 rounded-md bg-accent-primary text-text-primary font-semibold transition-all duration-200 hover:bg-accent-hover disabled:bg-bg-primary disabled:text-text-secondary disabled:cursor-not-allowed">
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TaskDetailsModal;