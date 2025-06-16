import { AnimatePresence, motion } from "framer-motion";
import { HiX, HiCalendar, HiMail, HiOutlineClock } from "react-icons/hi"; // Added HiOutlineClock for visual distinction

const UserDetailsModal = ({ user, isOpen, onClose }) => {
    if (!user) return null;

    // Helper to get initials if no profile picture exists
    const getInitials = (firstName, lastName) => {
        if (!firstName || !lastName) return 'U';
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    };

    // Helper to format the date string into a readable format
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-bg-dark bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="user-details-modal-title"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: -20 }}
                        className="bg-bg-secondary rounded-xl shadow-2xl w-full max-w-sm flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="flex items-center justify-end p-2">
                            <button onClick={onClose} className="p-2 rounded-full text-text-secondary hover:bg-bg-primary" aria-label="Close modal">
                                <HiX className="w-5 h-5" />
                            </button>
                        </header>
                        
                        <div className="flex flex-col items-center px-6 pb-6 -mt-8">
                             <div className="flex items-center justify-center w-24 h-24 mb-4 overflow-hidden rounded-full bg-accent-primary ring-4 ring-bg-card">
                                {user.photo_url ? (
                                    <img src={user.photo_url} alt="User profile" className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                                ) : (
                                    <span className="text-4xl font-semibold text-text-primary">{getInitials(user.first_name, user.last_name)}</span>
                                )}
                            </div>

                            <h2 id="user-details-modal-title" className="text-xl font-bold text-text-primary text-center">
                                {user.first_name} {user.last_name}
                            </h2>

                            <div className="w-full mt-6 text-sm text-text-secondary">
                                <div className="flex items-center gap-3 p-3 border-t border-bg-primary">
                                    <HiMail className="w-5 h-5 text-text-secondary flex-shrink-0" />
                                    <a href={`mailto:${user.email}`} className="text-text-primary hover:text-accent-primary truncate transition-colors">{user.email}</a>
                                </div>
                                <div className="flex items-center gap-3 p-3 border-t border-bg-primary">
                                    <HiCalendar className="w-5 h-5 text-text-secondary flex-shrink-0" />
                                    {/* MODIFIED: Label updated for clarity */}
                                    <span>Joined This Project: {formatDate(user.added_at)}</span>
                                </div>
                                {/* --- [NEW] Section for Account Creation Date --- */}
                                <div className="flex items-center gap-3 p-3 border-y border-bg-primary">
                                    <HiOutlineClock className="w-5 h-5 text-text-secondary flex-shrink-0" />
                                    {/* The new 'account_created_at' field is now used here */}
                                    <span>Account Created: {formatDate(user.account_created_at)}</span>
                                </div>
                                {/* Future details can be added here, maintaining the pattern */}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UserDetailsModal;