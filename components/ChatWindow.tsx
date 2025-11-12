
import React, { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '../types';
import BotIcon from './icons/BotIcon';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const TypingIndicator: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex items-center space-x-1.5 p-4"
  >
    <motion.div
      className="w-2 h-2 bg-text-secondary rounded-full"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="w-2 h-2 bg-text-secondary rounded-full"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 0.8, delay: 0.1, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="w-2 h-2 bg-text-secondary rounded-full"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 0.8, delay: 0.2, repeat: Infinity, ease: 'easeInOut' }}
    />
  </motion.div>
);

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);
  
  return (
    <div ref={scrollRef} className="h-full overflow-y-auto px-4 pt-8 md:px-8 lg:px-16">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'model' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-surface">
                  <BotIcon className="w-5 h-5 text-text-secondary" />
                </div>
              )}
              <div
                className={`max-w-md md:max-w-lg lg:max-w-2xl px-5 py-3 rounded-[var(--radius-xl)] break-words
                  ${message.role === 'user'
                    ? 'bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)] text-white whitespace-pre-wrap'
                    : 'glass-panel text-text-primary'
                  }`}
                style={{
                    borderRadius: message.role === 'user' ? '1.5rem 1.5rem 0.5rem 1.5rem' : '0.5rem 1.5rem 1.5rem 1.5rem',
                    filter: message.role === 'user' ? 'drop-shadow(0 4px 15px rgba(126, 63, 242, 0.4))' : 'none'
                }}
              >
                {message.image && (
                  <img src={message.image.url} alt="Attachment" className="rounded-lg mb-2 max-w-full h-auto" />
                )}
                 {message.role === 'model' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} className="markdown-content">
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  message.content
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === 'user') && (
             <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex items-start gap-4 justify-start"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-surface">
                <BotIcon className="w-5 h-5 text-text-secondary" />
              </div>
              <div className="rounded-[var(--radius-xl)] rounded-bl-lg glass-panel">
                  <TypingIndicator />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatWindow;
