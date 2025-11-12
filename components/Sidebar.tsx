
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, Settings, ChevronLeft, ChevronRight, Search, Pin, Trash2, X, Sun, Moon } from 'lucide-react';
import LogoIcon from './icons/LogoIcon';
import { ChatHistoryItem, Theme } from '../types';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onNewChat: () => void;
    chatHistory: ChatHistoryItem[];
    currentChatId: string | null;
    onSelectChat: (chatId: string) => void;
    onTogglePin: (chatId: string) => void;
    onDeleteChat: (chatId: string) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    onOpenSettings: () => void;
    appName: string;
}

const NavItem: React.FC<{ icon: React.ReactNode, label: string, onClick?: () => void, isExpanded: boolean }> = ({ icon, label, onClick, isExpanded }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200 relative hover:bg-white/10"
    aria-label={label}
  >
    {icon}
    <AnimatePresence>
        {isExpanded && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="font-medium whitespace-nowrap"
            >
              {label}
            </motion.span>
        )}
    </AnimatePresence>
  </button>
);

const HistoryItem: React.FC<{ chat: ChatHistoryItem, isActive: boolean, onSelect: () => void, onTogglePin: () => void, onDelete: () => void, isExpanded: boolean }> = 
({ chat, isActive, onSelect, onTogglePin, onDelete, isExpanded }) => (
    <motion.button
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        onClick={onSelect}
        className={`w-full text-left px-4 py-3 rounded-lg group relative ${isActive ? 'bg-accent-start/20' : 'hover:bg-white/10'}`}
    >
        <p className="font-medium text-sm truncate pr-12">{chat.title}</p>
        <AnimatePresence>
        {isExpanded && (
             <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); onTogglePin(); }} className="p-1.5 rounded-full hover:bg-white/20" aria-label={chat.pinned ? 'Unpin chat' : 'Pin chat'}>
                    <Pin size={16} className={`${chat.pinned ? 'text-accent-start fill-accent-start' : ''}`} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-full hover:bg-white/20" aria-label="Delete chat">
                    <Trash2 size={16} />
                </button>
            </div>
        )}
        </AnimatePresence>
    </motion.button>
);

const ThemeToggle: React.FC<{ theme: Theme, setTheme: (theme: Theme) => void, isExpanded: boolean }> = ({ theme, setTheme, isExpanded }) => {
    const isDark = theme === 'dark';
    const spring = { type: "spring", stiffness: 700, damping: 30 };

    if (!isExpanded) {
        return (
             <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="w-full flex items-center justify-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200 relative hover:bg-white/10"
                aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
                {isDark ? <Sun size={24} /> : <Moon size={24} />}
            </button>
        )
    }

    return (
        <div
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`w-full flex items-center px-2 py-1.5 rounded-full cursor-pointer relative h-12 ${isDark ? 'bg-slate-700/50' : 'bg-white/50'}`}
        >
            <motion.div className="absolute z-0 w-[calc(50%-4px)] h-[calc(100%-8px)] bg-accent-start rounded-full" layout transition={spring} style={{ left: isDark ? 'auto' : '4px', right: isDark ? '4px' : 'auto' }} />
            <div className="w-1/2 h-full flex items-center justify-center z-10 gap-2" aria-label="Toggle light theme">
                 <Sun size={20} className={`${isDark ? 'text-text-secondary' : 'text-white'}`} />
                 <span className={`font-medium ${isDark ? 'text-text-secondary' : 'text-white'}`}>Light</span>
            </div>
             <div className="w-1/2 h-full flex items-center justify-center z-10 gap-2" aria-label="Toggle dark theme">
                 <Moon size={20} className={`${isDark ? 'text-white' : 'text-text-secondary'}`} />
                 <span className={`font-medium ${isDark ? 'text-white' : 'text-text-secondary'}`}>Dark</span>
            </div>
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, onNewChat, chatHistory, currentChatId, onSelectChat, onTogglePin, onDeleteChat, theme, setTheme, onOpenSettings, appName }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredHistory = chatHistory.filter(chat => 
        chat.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pinned = filteredHistory.filter(c => c.pinned).sort((a, b) => b.timestamp - a.timestamp);
    const unpinned = filteredHistory.filter(c => !c.pinned).sort((a, b) => b.timestamp - a.timestamp);

  return (
    <motion.aside 
      animate={{ width: isOpen ? '18rem' : '5rem' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="h-screen flex flex-col
      glass-panel z-40 fixed left-0 top-0 bottom-0"
      style={{boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'}}
    >
        <div className="flex flex-col p-2 h-full">
            <div className={`flex items-center gap-3 mb-4 p-2 ${isOpen ? 'justify-start' : 'justify-center'}`}>
                <LogoIcon className="w-10 h-10 flex-shrink-0"/>
                <AnimatePresence>
                {isOpen && (
                    <motion.h1 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="text-xl font-bold whitespace-nowrap"
                    >
                        {appName}
                    </motion.h1>
                )}
                </AnimatePresence>
            </div>
            
            <div className="px-2">
                 <NavItem icon={<MessageSquarePlus size={24} />} label="New Chat" onClick={onNewChat} isExpanded={isOpen}/>
            </div>

            <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col overflow-hidden"
                >
                    <div className="px-4 pt-4 pb-2">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-10 bg-black/10 rounded-full pl-9 pr-8 text-sm placeholder:text-text-secondary border border-transparent focus:border-white/20 focus:ring-0 outline-none"
                            />
                             {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
            
            <div className="flex-1 overflow-y-auto px-2 mt-4 space-y-4">
                <AnimatePresence>
                {isOpen && pinned.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                        <h3 className="px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Pinned</h3>
                        {pinned.map(chat => <HistoryItem key={chat.id} chat={chat} isActive={chat.id === currentChatId} onSelect={() => onSelectChat(chat.id)} onTogglePin={() => onTogglePin(chat.id)} onDelete={() => onDeleteChat(chat.id)} isExpanded={isOpen}/>)}
                    </motion.div>
                )}
                </AnimatePresence>
                <AnimatePresence>
                {isOpen && unpinned.length > 0 && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                        <h3 className="px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Recent</h3>
                        {unpinned.map(chat => <HistoryItem key={chat.id} chat={chat} isActive={chat.id === currentChatId} onSelect={() => onSelectChat(chat.id)} onTogglePin={() => onTogglePin(chat.id)} onDelete={() => onDeleteChat(chat.id)} isExpanded={isOpen}/>)}
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </div>
        
        <div className="p-4 flex flex-col items-center gap-2 border-t border-white/10">
            <NavItem icon={<Settings size={24} />} label="Settings" onClick={onOpenSettings} isExpanded={isOpen}/>
            <ThemeToggle theme={theme} setTheme={setTheme} isExpanded={isOpen} />
             <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-text-primary hover:bg-white/10 transition-colors duration-200">
                {isOpen ? <ChevronLeft size={24}/> : <ChevronRight size={24} />}
                <AnimatePresence>
                {isOpen && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium whitespace-nowrap"
                    >
                      Collapse
                    </motion.span>
                )}
                </AnimatePresence>
            </button>
        </div>
    </motion.aside>
  );
};

export default Sidebar;