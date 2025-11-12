
import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import WelcomeScreen from './components/WelcomeScreen';
import PreviewPanel from './components/PreviewPanel';
import SettingsModal from './components/SettingsModal';
import { ChatMessage, Theme, InputMode, PreviewContent, ChatHistoryItem } from './types';
import { streamMultiModalResponse, generateImage, executeCode, extractTextFromImage, generatePresentation } from './services/geminiService';
import { config } from './config';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [inputMode, setInputMode] = useState<InputMode>('chat');
  const [previewContent, setPreviewContent] = useState<PreviewContent>(null);
  
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [userName, setUserName] = useState('User');

  // Apply dynamic theme from config on initial load
  useEffect(() => {
    // Set document title
    document.title = config.APP_NAME;

    // Inject Google Font
    const fontLink = document.createElement('link');
    fontLink.href = config.FONT_URL;
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // Apply CSS variables from config
    const root = document.documentElement;
    root.style.setProperty('font-family', `'${config.FONT_FAMILY}', sans-serif`);
    
    // Light theme colors
    Object.entries(config.colors.light).forEach(([key, value]) => {
      root.style.setProperty(`--${key}-light`, value);
    });
    
    // Dark theme colors
    Object.entries(config.colors.dark).forEach(([key, value]) => {
        root.style.setProperty(`--${key}-dark`, value);
    });

    // Accent colors
    Object.entries(config.colors.accent).forEach(([key, value]) => {
        root.style.setProperty(`--accent-${key}`, value);
    });

  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  // Load history from local storage on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('reactai-chat-history');
      if (savedHistory) {
        setChatHistory(JSON.parse(savedHistory));
      }
      const savedName = localStorage.getItem('reactai-user-name');
        if (savedName) {
        setUserName(savedName);
      }
    } catch (error) {
      console.error("Failed to load data from local storage:", error);
      localStorage.removeItem('reactai-chat-history');
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('reactai-chat-history', JSON.stringify(chatHistory));
    } catch (error) {
      console.error("Failed to save chat history to local storage:", error);
    }
  }, [chatHistory]);

  // Save user name to local storage whenever it changes
  useEffect(() => {
    try {
        localStorage.setItem('reactai-user-name', userName);
    } catch (error) {
        console.error("Failed to save user name to local storage:", error);
    }
  }, [userName]);


  // Mouse-tracking glow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const glow = document.getElementById('cursor-glow');
      if (glow) {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleNewChat = () => {
    setIsChatStarted(false);
    setMessages([]);
    setCurrentChatId(null);
    setInputMode('chat');
    setPreviewContent(null);
  };

  const handleSelectChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
        setCurrentChatId(chat.id);
        setMessages(chat.messages);
        setIsChatStarted(true);
        setPreviewContent(null);
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    }
  };

  const handleTogglePin = (chatId: string) => {
    setChatHistory(prev =>
        prev.map(chat =>
            chat.id === chatId ? { ...chat, pinned: !chat.pinned } : chat
        )
    );
  };

  const handleDeleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
        handleNewChat();
    }
  };

  const handleSendMessage = useCallback(async (text: string, attachment?: { url: string, base64: string, mimeType: string }) => {
    if (!text.trim() && !attachment) return;

    if (!isChatStarted) {
      setIsChatStarted(true);
    }
    
    const isFileAnalysis = attachment && !text.trim();

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: isFileAnalysis ? 'Analyze the attached image.' : text,
      image: attachment ? { url: attachment.url } : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const historyForAPI = currentChatId ? chatHistory.find(c => c.id === currentChatId)?.messages || [] : [];
    
    try {
      if (inputMode !== 'chat' || isFileAnalysis) {
        // Non-chat modes don't use streaming or history in the same way
        let modelMessage: ChatMessage;

        if (isFileAnalysis && attachment) {
            const extractedText = await extractTextFromImage(attachment.base64, attachment.mimeType);
            modelMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: `Here is the text I found in the image:\n\n${extractedText}`,
            };
        } else if (inputMode === 'generate') {
            const prompt = text.trim();
            const imageUrl = await generateImage(prompt);
            modelMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: `Here is the image I generated for: "${prompt}"`,
            };
            setPreviewContent({ type: 'image', data: { url: imageUrl, prompt }});
            setIsSidebarOpen(false);
        } else if (inputMode === 'code') {
            const prompt = text;
            const result = await executeCode(prompt);
            modelMessage = {
              id: (Date.now() + 1).toString(),
              role: 'model',
              content: "I've generated the code and a live preview for you.",
            };
            setPreviewContent({ type: 'code', data: { ...result, prompt }});
            setIsSidebarOpen(false);
        } else if (inputMode === 'presentation') {
            const { confirmationMessage, presentationData } = await generatePresentation(text);
            modelMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: confirmationMessage,
            };
            setPreviewContent({
                type: 'presentation',
                data: {
                    fileName: presentationData.fileName,
                    title: presentationData.title,
                    slidesCount: presentationData.slides.length,
                }
            });
            setIsSidebarOpen(false);
        } else {
             modelMessage = { id: 'error', role: 'model', content: 'Unknown action' };
        }
        setMessages(prev => [...prev, modelMessage]);

      } else {
        // Default chat streaming with history
        setPreviewContent(null);
        const stream = streamMultiModalResponse(text, historyForAPI, attachment ? { base64: attachment.base64, mimeType: attachment.mimeType } : undefined);
        let modelResponse = '';
        const modelMessageId = (Date.now() + 1).toString();

        setMessages(prev => [
          ...prev,
          { id: modelMessageId, role: 'model', content: '' },
        ]);

        for await (const chunk of stream) {
          modelResponse += chunk;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === modelMessageId
                ? { ...msg, content: modelResponse }
                : msg
            )
          );
        }

        const finalModelMessage: ChatMessage = { id: modelMessageId, role: 'model', content: modelResponse, };
        const newMessages = [...messages, userMessage, finalModelMessage];
        
        if (!currentChatId) {
            const newChatId = Date.now().toString();
            setCurrentChatId(newChatId);
            const newHistoryItem: ChatHistoryItem = {
                id: newChatId,
                title: text.substring(0, 40) + (text.length > 40 ? '...' : ''),
                timestamp: Date.now(),
                messages: newMessages,
                pinned: false,
            };
            setChatHistory(prev => [newHistoryItem, ...prev]);
        } else {
            setChatHistory(prev =>
                prev.map(chat =>
                    chat.id === currentChatId ? { ...chat, messages: newMessages, timestamp: Date.now() } : chat
                )
            );
        }
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInputMode('chat');
    }
  }, [isChatStarted, inputMode, currentChatId, chatHistory, messages]);
  
  return (
    <div className="h-screen w-screen flex bg-bg text-text-primary font-sans overflow-hidden">
      <div id="aurora-background">
        <div id="cursor-glow"></div>
        <div className="aurora-blur">
          <div className="aurora-shape-1"></div>
          <div className="aurora-shape-2"></div>
          <div className="aurora-shape-3"></div>
        </div>
      </div>
      
      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onTogglePin={handleTogglePin}
        onDeleteChat={handleDeleteChat}
        theme={theme}
        setTheme={setTheme}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        appName={config.APP_NAME}
      />

      <motion.main 
        className="flex-1 flex flex-col h-full relative"
        animate={{ paddingLeft: isSidebarOpen ? '18rem' : '5rem' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-1 h-full overflow-hidden">
            <motion.div
                className="flex flex-col h-full relative"
                animate={{ width: previewContent ? '30%' : '100%' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="flex-1 flex flex-col overflow-y-auto pb-40 relative z-10">
                    <AnimatePresence mode="wait">
                        {isChatStarted ? (
                            <motion.div key="chat" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="h-full">
                                <ChatWindow messages={messages} isLoading={isLoading} />
                            </motion.div>
                            ) : (
                            <motion.div key="welcome" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="h-full">
                                <WelcomeScreen 
                                    onPromptSelect={(prompt) => handleSendMessage(prompt)}
                                    welcomeTitle={config.WELCOME_TITLE}
                                    welcomeSubtitle={config.WELCOME_SUBTITLE}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-20">
                    <ChatInput 
                    onSendMessage={handleSendMessage} 
                    isLoading={isLoading}
                    inputMode={inputMode}
                    setInputMode={setInputMode}
                    appName={config.APP_NAME}
                    />
                </div>
            </motion.div>
             <AnimatePresence>
                {previewContent && (
                    <motion.div 
                        className="h-full flex-shrink-0"
                        style={{ width: '70%'}}
                        initial={{ x: '100%' }}
                        animate={{ x: '0%' }}
                        exit={{ x: '100%' }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <PreviewPanel content={previewContent} onClose={() => setPreviewContent(null)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </motion.main>
      
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        userName={userName}
        setUserName={setUserName}
      />
    </div>
  );
};

export default App;