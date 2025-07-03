import { useEffect } from 'react';

/**
 * Custom hook for handling keyboard shortcuts
 * @param {boolean} isOpen - Whether the drawer is open
 * @param {function} onClose - Function to call when ESC is pressed
 */
export const useKeyboardHandlers = (isOpen, onClose) => {
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);
}; 