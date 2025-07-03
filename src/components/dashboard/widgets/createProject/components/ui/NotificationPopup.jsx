import { motion, AnimatePresence } from 'framer-motion';
import { ANIMATION_VARIANTS } from '../../utils/constants.js';

/**
 * Notification popup component for displaying messages
 */
const NotificationPopup = ({ popup }) => {
  return (
    <AnimatePresence>
      {popup.show && (
        <motion.div 
          className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-xl shadow-lg text-text-inverse text-lg font-medium z-20 ${
            popup.type === 'error' ? 'bg-error' : popup.type === 'success' ? 'bg-success' : 'bg-info'
          }`} 
          variants={ANIMATION_VARIANTS.popupVariants} 
          initial="initial" 
          animate="animate" 
          exit="exit" 
          aria-live="polite"
        >
          {popup.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPopup; 