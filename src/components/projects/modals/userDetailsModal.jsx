import React from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { HiX, HiCalendar, HiMail, HiOutlineClock, HiShieldCheck } from "react-icons/hi";
import { useUser } from '../../../contexts/UserContext';
import { useProjects } from '../../../contexts/ProjectContext';
import { toast } from 'react-hot-toast';

const UserDetailsModal = ({ user, project, isOpen, onClose }) => {
    const { userData } = useUser();
    const { updateMemberRole } = useProjects();
    
    if (!user || !project) return null;

    const allMembers = project?.members || [];
    const currentUserInProject = allMembers.find(m => m.id === userData?.id);
    const currentUserRole = currentUserInProject?.role;
    
    const canManage = () => {
        if (!currentUserRole || !user) return false;
        if (currentUserRole === 'user') return false;
        if (user.id === userData?.id) return false;
        if (currentUserRole === 'editor' && user.role === 'owner') return false;
        return true;
    };

    const handleRoleChange = (newRole) => {
        // --- THIS IS THE FIX: ADD WARNING FOR OWNERSHIP TRANSFER ---
        if (newRole === 'owner') {
            const warningMessage = `Are you sure you want to transfer ownership to ${user.first_name} ${user.last_name}?\n\nYou will be demoted to an Editor and will lose owner privileges. This action cannot be undone.`;
            if (!window.confirm(warningMessage)) {
                return; // User clicked "Cancel", so we stop here.
            }
        }
        // --- END OF FIX ---

        if (!project?.project?.project_url) return;
        toast.promise(
            updateMemberRole(project.project.project_url, user.id, newRole),
            {
                loading: 'Updating role...',
                success: `Role for ${user.first_name} updated successfully!`,
                error: (err) => err.message || 'Failed to update role.'
            }
        ).then(() => {
             // Let's refetch to ensure the roles (especially the demotion) are updated everywhere
            onClose(); // This now implicitly triggers a refetch in ProjectUsersPage
        });
    };

    const getInitials = (firstName, lastName) => {
        if (!firstName) return 'U';
        return `${firstName[0]}${lastName ? lastName[0] : ''}`.toUpperCase();
    };

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
                                    <span>Joined This Project: {formatDate(user.added_at)}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 border-t border-bg-primary">
                                    <HiOutlineClock className="w-5 h-5 text-text-secondary flex-shrink-0" />
                                    <span>Account Created: {formatDate(user.account_created_at)}</span>
                                </div>
                                
                                <div className="flex flex-col p-3 border-y border-bg-primary">
                                    <div className="flex items-center gap-3">
                                        <HiShieldCheck className="w-5 h-5 text-text-secondary flex-shrink-0" />
                                        <label htmlFor="role-select" className="text-sm">Role in Project</label>
                                    </div>
                                    <select
                                        id="role-select"
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(e.target.value)}
                                        disabled={!canManage()}
                                        className="w-full mt-2 bg-bg-primary text-text-primary text-sm rounded-md py-2 px-3 border border-transparent focus:ring-2 focus:ring-accent-primary disabled:opacity-60 disabled:cursor-not-allowed capitalize"
                                    >
                                        <option value="owner" disabled={currentUserRole !== 'owner'}>Owner</option>
                                        <option value="editor">Editor</option>
                                        <option value="user">User</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UserDetailsModal;