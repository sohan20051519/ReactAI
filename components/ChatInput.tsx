
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { SendIcon } from './icons/SendIcon';
import { Paperclip, X, Image as ImageIcon, Code2, Presentation } from 'lucide-react';
import { InputMode } from '../types';

interface Attachment {
    url: string;
    base64: string;
    mimeType: string;
}

interface ChatInputProps {
  onSendMessage: (text: string, attachment?: Attachment) => void;
  isLoading: boolean;
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  appName: string;
}

const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const mimeType = result.split(';')[0].split(':')[1];
            const data = result.split(',')[1];
            resolve({ data, mimeType });
        };
        reader.onerror = error => reject(error);
    });
};

const ActionButton: React.FC<{ icon: React.ReactNode, onClick: () => void, label: string, isSelected?: boolean }> = ({ icon, onClick, label, isSelected = false }) => (
    <motion.button
        type="button"
        onClick={onClick}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ${isSelected ? 'bg-accent-start/30 ring-2 ring-accent-start/70' : 'bg-black/20 hover:bg-black/30'}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={label}
    >
        {icon}
    </motion.button>
);

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, inputMode, setInputMode, appName }) => {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const { data, mimeType } = await fileToBase64(file);
      const previewUrl = URL.createObjectURL(file);
      setAttachment({ url: previewUrl, base64: data, mimeType });
      setInputMode('chat'); // Reset mode on file attachment
    }
  };

  const clearAttachment = () => {
    if (attachment) {
        URL.revokeObjectURL(attachment.url);
    }
    setAttachment(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((text.trim() || attachment) && !isLoading) {
      onSendMessage(text, attachment);
      setText('');
      clearAttachment();
    }
  };

  const handleGenerateClick = () => {
    setInputMode(inputMode === 'generate' ? 'chat' : 'generate');
    textareaRef.current?.focus();
  };

  const handleCodeSnippetClick = () => {
    setInputMode(inputMode === 'code' ? 'chat' : 'code');
    textareaRef.current?.focus();
  };

  const handlePresentationClick = () => {
    setInputMode(inputMode === 'presentation' ? 'chat' : 'presentation');
    textareaRef.current?.focus();
  };

  const placeholderMap: Record<InputMode, string> = {
    chat: `Message ${appName}...`,
    generate: 'Describe the image you want to create...',
    code: 'Describe the HTML component you want to create...',
    presentation: 'Describe the presentation you want to create...',
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
        {attachment && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-24 h-24 mb-2 p-1 glass-panel rounded-lg"
            >
                <img src={attachment.url} alt="Attachment preview" className="w-full h-full object-cover rounded-md" />
                <button 
                    onClick={clearAttachment} 
                    className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-0.5 flex items-center justify-center hover:bg-red-500 transition-colors"
                    aria-label="Remove attachment"
                >
                    <X size={16} />
                </button>
            </motion.div>
        )}
      <form
        onSubmit={handleSubmit}
        className="w-full"
      >
        <div
          className="relative flex items-center w-full min-h-[4rem] rounded-full transition-all duration-300 glass-panel p-2"
          style={{boxShadow: 'var(--shadow-neumorphic-inset)'}}
        >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <div className="flex items-center gap-2 pl-2 flex-shrink-0">
                <ActionButton icon={<ImageIcon size={20} className="text-white/70"/>} onClick={handleGenerateClick} label="Generate an image" isSelected={inputMode === 'generate'} />
                <ActionButton icon={<Code2 size={20} className="text-white/70"/>} onClick={handleCodeSnippetClick} label="Analyze code snippet" isSelected={inputMode === 'code'} />
                <ActionButton icon={<Presentation size={20} className="text-white/70"/>} onClick={handlePresentationClick} label="Make a presentation" isSelected={inputMode === 'presentation'} />
                <ActionButton icon={<Paperclip size={20} className="text-white/70"/>} onClick={() => fileInputRef.current?.click()} label="Attach a file" />
            </div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={placeholderMap[inputMode]}
            rows={1}
            className="flex-1 h-full bg-transparent border-none focus:ring-0 resize-none outline-none text-base placeholder:text-text-secondary text-text-primary px-4 pr-16 py-3 self-center"
            disabled={isLoading}
            style={{ caretColor: 'var(--accent-end)' }}
          />
          <motion.button
            type="submit"
            disabled={isLoading || (!text.trim() && !attachment)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)] text-white disabled:opacity-50 transition-opacity"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              filter: 'drop-shadow(0 0 12px var(--accent-start))'
            }}
          >
            {isLoading ? (
               <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <SendIcon className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;