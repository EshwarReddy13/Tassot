import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProjects } from '../../contexts/ProjectContext';
import { useUser } from '../../contexts/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HiTrash, HiUserAdd } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import InviteModal from './widgets/inviteModal.jsx';
import UserDetailsModal from './widgets/userDetailsModal.jsx';

const ProjectUsersPage = () => {
    const { projectUrl } = useParams();
    const { currentProject, removeUserFromProject } = useProjects();
    const { userData } = useUser();
    
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const members = currentProject?.members || [];
    const isOwner = currentProject?.project?.owner_id === userData?.id;

    const handleRemoveUser = (member) => {
        if (!isOwner) {
            toast.error("Only the project owner can remove members.");
            return;
        }
        if (member.id === userData.id) {
             toast.error("You cannot remove yourself from the project.");
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
                className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">Project Members</h1>
                        <p className="text-text-secondary mt-1">{members.length} member(s) in this project.</p>
                    </div>
                    {isOwner && (
                         <button onClick={() => setInviteModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-accent-primary rounded-lg hover:bg-accent-hover transition-colors">
                            <HiUserAdd className="w-5 h-5"/>
                            Add User
                        </button>
                    )}
                </div>

                <div className="bg-bg-secondary rounded-lg shadow overflow-hidden">
                    <ul className="divide-y divide-bg-primary">
                        <AnimatePresence>
                             {members.map(member => (
                                <motion.li 
                                    key={member.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-bg-card transition-colors duration-200 group"
                                >
                                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => setSelectedUser(member)}>
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
                                        {member.id === currentProject.project.owner_id ? (
                                             <span className="px-2 py-1 text-xs font-medium text-accent-primary bg-bg-primary rounded-full">Owner</span>
                                        ) : (
                                            <button onClick={() => handleRemoveUser(member)} aria-label={`Remove ${member.first_name}`} className="p-2 text-text-secondary hover:text-error rounded-full transition-colors">
                                                <HiTrash className="w-5 h-5"/>
                                            </button>
                                        )}
                                    </div>
                                </motion.li>
                             ))}
                        </AnimatePresence>
                    </ul>
                </div>
            </motion.div>
            
            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
                projectUrl={projectUrl}
            />

            <UserDetailsModal
                user={selectedUser}
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
            />
        </>
    );
};

export default ProjectUsersPage;