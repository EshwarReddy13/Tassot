import { motion, AnimatePresence } from 'framer-motion';
import { forwardRef } from 'react';

// Animation variants for the form popup
const formVariants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } },
};

// AddColumnForm component for adding a new column to the Kanban board
const AddColumnForm = forwardRef(
  ({ isAdding, name, error, onAddColumnClick, onColumnNameChange, onAddColumn, onCancelAddColumn }, ref) => {
    if (!isAdding) {
      return (
        <motion.button
          className="w-full h-32 flex justify-center items-center bg-[#4a4a56] rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white text-text-primary hover:bg-[#5a5a66] transition-colors duration-200"
          onClick={onAddColumnClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-label="Add new column"
        >
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>
      );
    }

    return (
      <AnimatePresence>
        <motion.div
          className="bg-bg-card p-4 rounded-lg w-full max-w-[20rem] mx-auto"
          variants={formVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          role="dialog"
          aria-label="Add new column form"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onAddColumn();
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="column-name"
                className="block text-text-primary font-medium mb-1"
                style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}
              >
                Column Name
              </label>
              <input
                id="column-name"
                ref={ref}
                type="text"
                value={name}
                onChange={(e) => onColumnNameChange(e.target.value)}
                className="w-full p-2 rounded-lg bg-bg-secondary text-text-primary border border-[#4a4a56] focus-visible:outline-2 focus-visible:outline-accent-primary"
                placeholder="Enter column name"
                aria-label="Enter new column name"
                style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}
                required
              />
            </div>

            {error && (
              <motion.p
                className="text-red-400 text-sm text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                role="alert"
              >
                {error}
              </motion.p>
            )}

            <div className="flex justify-between gap-2">
              <motion.button
                type="button"
                onClick={onCancelAddColumn}
                className="flex-1 p-2 bg-[#4a4a56] text-text-primary rounded-lg hover:bg-[#5a5a66] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}
                aria-label="Cancel adding new column"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="flex-1 p-2 bg-accent-primary text-text-primary rounded-lg hover:bg-[#7a5ac4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}
                aria-label="Add new column"
              >
                Add
              </motion.button>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    );
  }
);

AddColumnForm.displayName = 'AddColumnForm';

export { AddColumnForm };