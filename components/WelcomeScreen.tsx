
import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
    onPromptSelect: (prompt: string) => void;
    welcomeTitle: string;
    welcomeSubtitle: string;
}

const SuggestionCard: React.FC<{ title: string; description: string; icon: string; onClick: () => void; }> = ({ title, description, icon, onClick }) => (
    <motion.button
        onClick={onClick}
        className="p-6 rounded-[var(--radius-xl)] text-left w-full h-full flex flex-col justify-between transition-all duration-300 glass-panel"
        style={{boxShadow: 'var(--shadow-neumorphic)'}}
        whileHover={{ y: -8, boxShadow: 'var(--shadow-neumorphic)' }}
        whileTap={{ scale: 0.95 }}
    >
        <div>
            <span className="text-3xl">{icon}</span>
            <h3 className="mt-4 text-lg font-semibold text-text-primary">{title}</h3>
            <p className="mt-1 text-text-secondary">{description}</p>
        </div>
    </motion.button>
);


const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onPromptSelect, welcomeTitle, welcomeSubtitle }) => {
    const suggestions = [
        { title: 'Content Help', description: 'Draft a presentation', icon: '📝', prompt: 'Help me create a presentation about the future of renewable energy.' },
        { title: 'Brainstorm Ideas', description: 'For my new project', icon: '💡', prompt: 'Brainstorm some innovative names for a new tech startup focused on AI-powered personal assistants.' },
        { title: 'Job Application', description: 'Write a cover letter', icon: '📄', prompt: 'Help me write a compelling cover letter for a software engineer position at a leading tech company.' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="h-full flex flex-col justify-center items-center px-4">
            <motion.div 
                className="w-full max-w-4xl text-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h1 className="text-5xl md:text-6xl font-bold text-text-primary" variants={itemVariants}>
                    {welcomeTitle}
                </motion.h1>
                <motion.h2 className="text-5xl md:text-6xl font-bold text-text-secondary mt-2" variants={itemVariants}>
                    {welcomeSubtitle}
                </motion.h2>
                
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
                    variants={containerVariants}
                >
                    {suggestions.map((s) => (
                        <motion.div key={s.title} variants={itemVariants}>
                            <SuggestionCard 
                                title={s.title} 
                                description={s.description} 
                                icon={s.icon}
                                onClick={() => onPromptSelect(s.prompt)}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default WelcomeScreen;