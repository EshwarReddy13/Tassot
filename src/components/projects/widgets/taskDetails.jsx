import { Fragment, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiOutlineNewspaper, HiOutlineCollection, HiOutlineUser, HiOutlineChatAlt2 } from 'react-icons/hi';
import CommentList from './commentList'; // --- NEW IMPORT ---

const TaskDetailsModal = ({ isOpen, onClose, task, boards, onUpdateTask, creator }) => {
  const [updatedTask, setUpdatedTask] = useState(task);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setUpdatedTask(task);
  }, [task]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedTask(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBoardChange = (e) => {
    const { value } = e.target;
    setUpdatedTask(prev => ({ ...prev, board_id: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdateTask(updatedTask);
    setIsSaving(false);
    onClose();
  };

  const hasChanges = JSON.stringify(task) !== JSON.stringify(updatedTask);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-bg-dark bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-bg-secondary rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" // Increased width to max-w-4xl
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
                className="p-2 rounded-full text-text-secondary hover:bg-bg-primary hover:text-white transition-colors"
                aria-label="Close task details"
              >
                <HiX className="w-6 h-6" />
              </button>
            </header>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  {/* Notes Section */}
                  <section>
                    <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <HiOutlineNewspaper className="w-5 h-5 text-text-secondary" />
                      Notes
                    </h3>
                    <textarea
                      name="notes"
                      value={updatedTask.notes || ''}
                      onChange={handleInputChange}
                      placeholder="Add detailed notes for this task..."
                      className="w-full h-48 bg-bg-primary text-text-primary placeholder-text-placeholder p-3 rounded-md border-2 border-transparent focus:border-accent-primary focus:outline-none resize-y transition-colors"
                      aria-label="Task notes"
                    />
                  </section>
                  
                  {/* --- NEW COMMENTS SECTION --- */}
                  <section>
                    <h3 className="text-base font-semibold text-text-primary mb-2 flex items-center gap-2">
                        <HiOutlineChatAlt2 className="w-5 h-5 text-text-secondary" />
                        Comments
                    </h3>
                    <CommentList taskId={task.id} />
                  </section>
                </div>

                {/* Sidebar */}
                <aside className="space-y-6">
                  <section>
                    <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <HiOutlineCollection className="w-5 h-5 text-text-secondary" />
                      Board
                    </h3>
                    <select
                      name="board_id"
                      value={updatedTask.board_id}
                      onChange={handleBoardChange}
                      className="w-full bg-bg-primary text-text-primary p-2.5 rounded-md border-2 border-transparent focus:border-accent-primary focus:outline-none appearance-none"
                      aria-label="Change task board"
                    >
                      {boards.map(board => (
                        <option key={board.id} value={board.id}>{board.name}</option>
                      ))}
                    </select>
                  </section>
                  
                  <section>
                     <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <HiOutlineUser className="w-5 h-5 text-text-secondary" />
                        Created By
                      </h3>
                      {creator ? (
                        <div className="flex items-center gap-3">
                          <img src={creator.photo_url || `https://ui-avatars.com/api/?name=${creator.first_name}+${creator.last_name}&background=3a3a44&color=fff`} alt={`${creator.first_name} ${creator.last_name}`} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <p className="font-semibold text-text-primary">{`${creator.first_name} ${creator.last_name}`}</p>
                            <p className="text-sm text-text-secondary">{creator.email}</p>
                          </div>
                        </div>
                      ) : (
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-bg-primary animate-pulse"></div>
                            <div className="space-y-2">
                                <div className="w-24 h-4 bg-bg-primary rounded animate-pulse"></div>
                                <div className="w-32 h-3 bg-bg-primary rounded animate-pulse"></div>
                            </div>
                        </div>
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