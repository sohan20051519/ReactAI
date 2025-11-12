
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    setUserName: (name: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, userName, setUserName }) => {
    const [currentName, setCurrentName] = useState(userName);

    useEffect(() => {
        setCurrentName(userName);
    }, [userName, isOpen]);

    const handleSave = () => {
        if (currentName.trim()) {
            setUserName(currentName.trim());
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="glass-panel rounded-[var(--radius-xl)] w-full max-w-md border border-highlight-color"
                        style={{boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'}}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-6 flex items-center justify-between border-b border-highlight-color">
                            <h2 className="text-xl font-bold">Profile Settings</h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Close settings">
                                <X size={24} />
                            </button>
                        </header>
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="userNameInput" className="block text-sm font-medium text-text-secondary mb-2">Display Name</label>
                                    <input
                                        id="userNameInput"
                                        type="text"
                                        value={currentName}
                                        onChange={(e) => setCurrentName(e.target.value)}
                                        className="w-full h-12 bg-black/10 rounded-lg px-4 text-base placeholder:text-text-secondary border border-transparent focus:border-white/20 focus:ring-0 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-6">
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-full bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)] text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                                    disabled={!currentName.trim() || currentName.trim() === userName}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SettingsModal;
