import { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { HiX, HiClipboardCopy } from 'react-icons/hi';
import toast from 'react-hot-toast';

const NEON_COLORS = [
    // Reds -> Pinks -> Orange -> Yellow
    '#FF3B30', '#FF2D55', '#F50057', '#FF9500', '#FFCC00',
    // Greens -> Teals -> Cyan
    '#AEEA00', '#34C759', '#1DE9B6', '#00BFA5', '#00DDFF',
    // Blues -> Purples -> Indigos
    '#5AC8FA', '#007AFF', '#5856D6', '#AF52DE', '#AA00FF'
];

const BoardColorPickerModal = ({ isOpen, onClose, onColorSelect, currentColor }) => {
    const [color, setColor] = useState(currentColor);

    useEffect(() => {
        if (isOpen) {
            setColor(currentColor);
        }
    }, [currentColor, isOpen]);
    
    const handleSave = () => {
        onColorSelect(color);
        onClose();
    };

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(color);
        toast.success('Color copied to clipboard!', {
            duration: 2000,
            position: 'bottom-center',
            style: {
                background: '#333',
                color: '#fff',
            },
        });
    }, [color]);

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                        className="glass-modal p-6 rounded-2xl w-full max-w-2xl relative border border-white/10"
                    >
                        {/* Close Button */}
                        <motion.button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label="Close modal"
                        >
                            <HiX className="w-6 h-6 text-text-secondary" />
                        </motion.button>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Left side: Color Picker */}
                            <div className="flex flex-col">
                                 <h3 className="text-xl font-bold text-text-primary mb-4">Choose a Color</h3>
                                <HexColorPicker color={color} onChange={setColor} className="!w-full !h-auto" />
                            </div>

                            {/* Right side: Presets, Preview, and Actions */}
                            <div className="flex flex-col">
                                <h4 className="font-semibold text-text-primary mb-3">Neon Presets</h4>
                                <div className="grid grid-cols-5 gap-3 mb-6">
                                    {NEON_COLORS.map(presetColor => (
                                        <motion.button
                                            key={presetColor}
                                            onClick={() => setColor(presetColor)}
                                            className="w-full h-10 rounded-lg cursor-pointer border-2 transition-transform,border-color"
                                            style={{ 
                                                backgroundColor: presetColor,
                                                borderColor: color.toLowerCase() === presetColor.toLowerCase() ? '#ffffff' : 'transparent'
                                            }}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            aria-label={`Select color ${presetColor}`}
                                        />
                                    ))}
                                </div>

                                <h4 className="font-semibold text-text-primary mb-3">Preview & Code</h4>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-20 h-20 rounded-xl border-2 border-white/20 shadow-lg" style={{ backgroundColor: color }} />
                                    <div className="relative w-full">
                                        <HexColorInput
                                            prefixed
                                            alpha
                                            color={color}
                                            onChange={setColor}
                                            className="w-full glass-input pr-10"
                                        />
                                        <button onClick={handleCopy} className="absolute top-1/2 right-3 -translate-y-1/2 text-text-secondary hover:text-text-primary">
                                            <HiClipboardCopy />
                                        </button>
                                    </div>
                                </div>
                                
                                <motion.button
                                    onClick={handleSave}
                                    className="w-full mt-auto py-3 bg-accent-primary text-white font-bold rounded-lg shadow-lg hover:bg-accent-primary-dark transition-all duration-200"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Save Color
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    if (typeof window === 'undefined') {
        return null;
    }
    
    const modalRoot = document.getElementById('modal-root');
    return modalRoot ? ReactDOM.createPortal(modalContent, modalRoot) : null;
};

export default BoardColorPickerModal; 