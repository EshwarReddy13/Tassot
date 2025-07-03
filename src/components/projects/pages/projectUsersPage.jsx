import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjects } from '../../../contexts/ProjectContext.jsx';
import { useUser } from '../../../contexts/UserContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { HiTrash, HiUserAdd } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import InviteModal from '../modals/InviteModal.jsx';
import UserDetailsModal from '../modals/UserDetailsModal.jsx';

const roleStyles = {
    owner: 'bg-yellow-400/20 text-yellow-300 ring-yellow-400/30',
    editor: 'bg-sky-400/20 text-sky-300 ring-sky-400/30',
    user: 'bg-gray-400/20 text-gray-300 ring-gray-400/30',
};

const RoleBadge = ({ role }) => {
    if (!role) return null;
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ring-1 ring-inset ${roleStyles[role] || roleStyles.user}`}>
            {role}
        </span>
    );
};

const ProjectUsersPage = () => {
    const { projectUrl } = useParams();
    const { currentProject, removeUserFromProject, getProjectDetails } = useProjects();
    const { userData } = useUser();
    
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [members, setMembers] = useState([]);

    // We keep a local copy of members that syncs from the context.
    // This allows smooth updates when a role changes.
    useEffect(() => {
        if(currentProject?.members) {
            setMembers(currentProject.members);
        }
    }, [currentProject]);

    // When the modal closes after a role change, re-fetch details to ensure roles are synced
    const handleCloseUserDetails = () => {
        setSelectedUser(null);
        getProjectDetails(projectUrl);
    }
    
    const currentUser = members.find(m => m.id === userData?.id);
    const currentUserRole = currentUser?.role;

    const canManage = (targetUser) => {
        if (!currentUserRole || !targetUser) return false;
        if (currentUserRole === 'user') return false;
        if (targetUser.id === userData?.id) return false;
        if (currentUserRole === 'editor' && targetUser.role === 'owner') return false;
        return true;
    };

    const handleRemoveUser = (member) => {
        if (!canManage(member)) {
            toast.error("You do not have permission to remove this member.");
            return;
        }
        
        if (window.confirm(`Are you sure you want to remove ${member.first_name} ${member.last_name} from this project?`)) {
            toast.promise(
                removeUserFromProject(projectUrl, member.id),
                {
                    loading: 'Removing member...',
                    success: `${member.first_name} has been removed.`,
                    error: (err) => err.message || 'Could not remove member.',
                }
            );
        }
    };
    
    return (
        <>
            <motion.div
                className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <header className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">Project Members</h1>
                        <p className="text-text-secondary mt-1">{members.length} member(s) in this project.</p>
                    </div>
                    {(currentUserRole === 'owner' || currentUserRole === 'editor') && (
                         <button onClick={() => setInviteModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-accent-primary rounded-lg hover:bg-accent-hover transition-colors">
                            <HiUserAdd className="w-5 h-5"/>
                            Add User
                        </button>
                    )}
                </header>

                <main className="bg-bg-secondary rounded-lg shadow overflow-hidden">
                    <ul className="divide-y divide-bg-primary">
                        <AnimatePresence>
                             {members.map(member => (
                                <motion.li 
                                    key={member.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
                                    className="flex items-center justify-between px-6 py-4"
                                >
                                    <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setSelectedUser(member)}>
                                        <img 
                                            src={member.photo_url || `https://ui-avatars.com/api/?name=${member.first_name}+${member.last_name}&background=3a3a44&color=fff`} 
                                            alt={`${member.first_name} ${member.last_name}`}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-semibold text-text-primary group-hover:text-accent-primary transition-colors">{member.first_name} {member.last_name}</p>
                                            <p className="text-sm text-text-secondary">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <RoleBadge role={member.role} />
                                        {canManage(member) && (
                                            <button onClick={() => handleRemoveUser(member)} aria-label={`Remove ${member.first_name}`} className="p-2 text-text-secondary hover:text-error rounded-full transition-colors">
                                                <HiTrash className="w-5 h-5"/>
                                            </button>
                                        )}
                                    </div>
                                </motion.li>
                             ))}
                        </AnimatePresence>
                    </ul>
                </main>
            </motion.div>
            
            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
                projectUrl={projectUrl}
            />
            
            <UserDetailsModal
                user={selectedUser}
                project={currentProject} 
                isOpen={!!selectedUser}
                onClose={handleCloseUserDetails} // Use the new handler
            />
        </>
    );
};

export default ProjectUsersPage;