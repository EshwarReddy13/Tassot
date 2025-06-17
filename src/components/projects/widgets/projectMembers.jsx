import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../../../contexts/UserContext'; // This is needed to check the current user's role

const PlusIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 5v10m5-5H5"/>
  </svg>
);

const UserAvatar = ({ member }) => {
  if (!member || !member.first_name) return null;
  const initials = `${member.first_name[0]}${member.last_name ? member.last_name[0] : ''}`.toUpperCase();
  return (
    <div className="group relative flex h-9 w-9 items-center justify-center rounded-full bg-bg-secondary ring-2 ring-bg-primary transition-colors" title={`${member.first_name} ${member.last_name}`}>
      {member.photo_url ? (
        <img src={member.photo_url} alt={`${member.first_name} ${member.last_name}`} className="h-full w-full rounded-full object-cover" />
      ) : (
        <span className="text-xs font-bold text-text-primary">{initials}</span>
      )}
    </div>
  );
};

const ProjectMembers = ({ members = [], onInviteClick }) => {
  // --- NON-DESTRUCTIVE UI LOGIC ---
  // The 'Invite' button should only be shown to users who have permission.
  // We check the role of the currently logged-in user here.
  const { userData } = useUser();
  const currentUser = members.find(m => m.id === userData?.id);
  const canInvite = currentUser?.role === 'owner' || currentUser?.role === 'editor';
  // --- END OF UI LOGIC ---

  const maxVisible = 3;
  const visibleMembers = members.slice(0, maxVisible);
  const hiddenCount = Math.max(0, members.length - maxVisible);
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 }}};
  const itemVariants = { hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 }};

  return (
    <motion.div className="flex items-center" variants={containerVariants} initial="hidden" animate="visible">
      {visibleMembers.map((member, index) => (
        <motion.div key={member.id || index} variants={itemVariants} className={`-ml-2 first:ml-0`}>
          <UserAvatar member={member} />
        </motion.div>
      ))}
      {hiddenCount > 0 && (
        <motion.div variants={itemVariants} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-bg-card ring-2 ring-bg-primary" title={`${hiddenCount} more member${hiddenCount > 1 ? 's' : ''}`}>
          <span className="text-xs font-bold text-text-secondary">+{hiddenCount}</span>
        </motion.div>
      )}
      
      {/* --- The Invite button is now correctly controlled by role permissions --- */}
      {canInvite && (
          <motion.button onClick={onInviteClick} variants={itemVariants} className="-ml-2 flex h-9 items-center gap-x-1.5 rounded-r-full rounded-l-md bg-accent-primary px-3 py-1.5 text-white transition-colors duration-300 hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary" aria-label="Invite new members" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <PlusIcon className="h-5 w-5" />
            <span className="pr-1 text-sm font-semibold">Invite</span>
        </motion.button>
      )}
    </motion.div>
  );
};

export default ProjectMembers;