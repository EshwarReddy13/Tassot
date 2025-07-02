import React, { useState } from 'react';
import { useAI } from '../../../contexts/AIContext.jsx';
import { toast } from 'react-hot-toast';
import { HiCheck, HiX, HiSparkles } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const AIEnhancedInput = ({ value, onChange, onBlur, name, placeholder, rows = 1, onEnhance }) => {
    const { isAIContextLoading } = useAI();
    const [suggestion, setSuggestion] = useState('');
    const [mode, setMode] = useState('idle'); // 'idle', 'suggesting'

    const handleEnhance = async () => {
        if (!value.trim()) {
            toast.error("Please enter some text first.");
            return;
        }
        if (typeof onEnhance !== 'function') {
            console.error("AIEnhancedInput requires a valid onEnhance function prop.");
            toast.error("AI feature not configured for this input.");
            return;
        }
        
        toast.promise(
            onEnhance(value), // This correctly calls the function it was given.
            {
                loading: 'AI is thinking...',
                success: (enhancedText) => {
                    setSuggestion(enhancedText);
                    setMode('suggesting');
                    return 'Suggestion ready!';
                },
                error: (err) => err.message || 'AI enhancement failed.',
            }
        );
    };

    const handleAccept = () => {
        onChange({ target: { name, value: suggestion } });
        setMode('idle');
        setSuggestion('');
    };

    const handleReject = () => {
        setMode('idle');
        setSuggestion('');
    };

    const InputComponent = rows > 1 ? 'textarea' : 'input';

    return (
        <div className="relative w-full">
            <InputComponent
                value={mode === 'suggesting' ? suggestion : value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                rows={rows}
                name={name}
                className={`w-full bg-bg-primary text-text-primary placeholder-text-placeholder p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary pr-10 transition-colors duration-300 ${mode === 'suggesting' ? 'text-accent-primary caret-accent-primary' : ''}`}
            />
            <AnimatePresence mode="wait">
                {mode === 'idle' ? (
                    <motion.button
                        key="enhance"
                        type="button"
                        onClick={handleEnhance}
                        disabled={isAIContextLoading}
                        className="absolute top-1/2 -translate-y-1/2 right-2 p-1 text-text-secondary hover:text-accent-primary disabled:opacity-50 disabled:animate-pulse transition-colors"
                        title="Enhance with AI"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                    >
                        <HiSparkles className="w-5 h-5" />
                    </motion.button>
                ) : (
                    <motion.div
                        key="actions"
                        className="absolute top-1/2 -translate-y-1/2 right-2 flex gap-1"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                    >
                        <button type="button" onClick={handleAccept} className="p-1 text-green-400 hover:bg-green-500/20 rounded-full" title="Accept Suggestion">
                            <HiCheck className="w-5 h-5" />
                        </button>
                        <button type="button" onClick={handleReject} className="p-1 text-red-400 hover:bg-red-500/20 rounded-full" title="Reject Suggestion">
                            <HiX className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIEnhancedInput;