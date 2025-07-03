import { motion } from 'framer-motion';
import { ANIMATION_VARIANTS } from '../../utils/constants.js';

/**
 * Step 3: Invite Team Members - Team collaboration setup
 */
const InviteStep = ({
  projectName,
  userInputProjectKey,
  email,
  emailError,
  invitedUsers,
  onEmailChange,
  onAddEmail,
  onRemoveUser,
  disabled
}) => {
  return (
    <motion.div 
      key="invite-step" 
      variants={ANIMATION_VARIANTS.fieldVariants} 
      initial="initial" 
      animate="animate" 
      exit="exit" 
      className="space-y-8"
    >
      <div className="text-center mb-10">
        <h2 className="text-text-primary text-4xl font-bold mb-3">Invite Team Members</h2>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Invite team members to collaborate on "<span className="text-accent-primary font-semibold">{projectName}</span>" (Key: <span className="font-mono text-accent-primary">{userInputProjectKey}</span>).
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-text-primary text-lg font-medium mb-2">
            Email Address
          </label>
          <div className="flex gap-3">
            <div className="flex-1">
              <input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => onEmailChange(e.target.value)} 
                className="w-full h-14 bg-bg-secondary text-text-primary rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-accent-primary border border-border-secondary hover:border-border-primary transition-colors" 
                placeholder="Enter email address" 
                disabled={disabled} 
              />
              {emailError && (
                <motion.p 
                  className="text-error text-sm mt-2" 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ duration: 0.3 }}
                >
                  {emailError}
                </motion.p>
              )}
            </div>
            <motion.button 
              className="bg-accent-primary hover:bg-accent-hover text-text-inverse h-14 px-6 rounded-xl font-semibold transition-colors shadow-lg" 
              onClick={onAddEmail} 
              disabled={!email || !!emailError || disabled}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Add User
            </motion.button>
          </div>
          <p className="text-text-tertiary text-sm mt-2 bg-bg-card rounded-lg px-4 py-3 border border-border-secondary">
            💡 <strong>Tip:</strong> You don't need to add users now. You can always invite team members later. You can create a project without adding anyone initially.
          </p>
        </div>
        
        {/* Invited Users List */}
        {invitedUsers.length > 0 && (
          <div>
            <h3 className="text-text-primary text-lg font-medium mb-4">
              Invited Users ({invitedUsers.length})
            </h3>
            <div className="space-y-3">
              {invitedUsers.map((user, index) => (
                <motion.div 
                  key={user.email} 
                  className="flex items-center gap-4 bg-bg-card px-4 py-3 rounded-xl border border-border-secondary hover:border-border-primary transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {user.photo ? (
                    <img 
                      src={user.photo} 
                      alt={user.name || user.email} 
                      className="w-10 h-10 rounded-full" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary font-bold text-lg">
                      {user.email[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-text-primary font-medium">
                      {user.name || user.email}
                    </div>
                    {user.name && (
                      <div className="text-text-secondary text-sm">{user.email}</div>
                    )}
                  </div>
                  <button 
                    className="text-error hover:text-error/80 text-sm font-medium px-3 py-1 rounded-lg hover:bg-error/10 transition-colors" 
                    onClick={() => onRemoveUser(index)}
                  >
                    Remove
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InviteStep; 