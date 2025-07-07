import React from 'react';
import { motion } from 'framer-motion';

const ProjectCardMembers = ({ members = [] }) => {
  if (!members || members.length === 0) {
    return null;
  }

  const maxVisible = 3;
  const visibleMembers = members.slice(0, maxVisible);
  const hiddenCount = Math.max(0, members.length - maxVisible);

  const getInitials = (firstName, lastName) => {
    if (!firstName) return '?';
    return `${firstName[0]}${lastName ? lastName[0] : ''}`.toUpperCase();
  };

  return (
    <div className="flex items-center -space-x-2">
      {visibleMembers.map((member, index) => (
        <motion.div
          key={member.id}
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <div 
            className="w-8 h-8 rounded-full bg-bg-secondary border-2 border-bg-dark flex items-center justify-center overflow-hidden"
            title={`${member.first_name} ${member.last_name || ''}`}
          >
            {member.photo_url ? (
              <img
                src={member.photo_url}
                alt={`${member.first_name} ${member.last_name || ''}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-xs font-semibold text-text-primary">
                {getInitials(member.first_name, member.last_name)}
              </span>
            )}
          </div>
          
          {/* Owner indicator */}
          {member.role === 'owner' && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-primary rounded-full border border-bg-dark flex items-center justify-center">
              <span className="text-[8px] text-white">👑</span>
            </div>
          )}
        </motion.div>
      ))}
      
      {hiddenCount > 0 && (
        <motion.div
          className="w-8 h-8 rounded-full bg-bg-tertiary border-2 border-bg-dark flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: visibleMembers.length * 0.1 }}
          title={`${hiddenCount} more member${hiddenCount > 1 ? 's' : ''}`}
        >
          <span className="text-xs font-semibold text-text-secondary">
            +{hiddenCount}
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default ProjectCardMembers; 