import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Theme } from '../types';
import { executeCode } from '../services/geminiService';

interface CodeCanvasProps {
  theme: Theme;
}

const CodeCanvas: React.FC<CodeCanvasProps> = ({ theme }) => {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'output' | 'preview'>('output');

  const handleRunCode = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setOutput('');
    setPreviewCode(null);
    setViewMode('output'); // Default to output view on new run
    try {
      const result = await executeCode(code);
      setOutput(result.explanation);
      if (result.code && result.code.trim().length > 0) {
        setPreviewCode(result.code);
      }
    } catch (error) {
      setOutput('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-8 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col h-full"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Code Canvas</h2>
        <div className="flex-1 flex flex-col lg:flex-row gap-4 h-[calc(100%-4rem)]">
          {/* Code Input */}
          <div className={`w-full lg:w-1/2 flex flex-col rounded-3xl backdrop-blur-xl transition-all duration-300 p-4 ${
            theme === 'dark'
              ? 'bg-slate-800/50 shadow-neumorphic-dark shadow-glass-inset-dark'
              : 'bg-white/30 shadow-neumorphic-light shadow-glass-inset-light'
          }`}>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter HTML, CSS, and JS to see a live preview..."
              className={`flex-1 w-full bg-transparent border-none focus:ring-0 resize-none outline-none font-mono text-sm
                ${theme === 'dark' ? 'text-slate-200 placeholder:text-slate-500' : 'text-slate-800 placeholder:text-slate-400'}`}
              disabled={isLoading}
            />
            <motion.button
              onClick={handleRunCode}
              disabled={isLoading || !code.trim()}
              className="mt-4 self-end w-14 h-14 rounded-full flex items-center justify-center
                bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] text-white disabled:opacity-50 transition-opacity"
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9, rotate: 0 }}
              style={{boxShadow: '0 0 20px -5px var(--primary-color)'}}
            >
              {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Play size={24} />}
            </motion.button>
          </div>

          {/* Code Output / Preview */}
           <div className={`w-full lg:w-1/2 flex flex-col rounded-3xl backdrop-blur-xl transition-all duration-300 overflow-hidden ${
              theme === 'dark'
              ? 'bg-slate-900/60 shadow-glass-inset-dark'
              : 'bg-white/40 shadow-glass-inset-light'
          }`}>
              {/* Tabs */}
              <div className={`flex border-b ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
                  <button 
                      onClick={() => setViewMode('output')} 
                      className={`px-5 py-3 text-sm font-medium transition-colors duration-200 w-full ${
                      viewMode === 'output' 
                          ? (theme === 'dark' ? 'bg-white/10' : 'bg-black/5') 
                          : (theme === 'dark' ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-black/5')
                      }`}
                  >
                      Output
                  </button>
                  {previewCode && (
                      <button 
                          onClick={() => setViewMode('preview')} 
                          className={`px-5 py-3 text-sm font-medium transition-colors duration-200 w-full ${
                          viewMode === 'preview' 
                              ? (theme === 'dark' ? 'bg-white/10' : 'bg-black/5') 
                              : (theme === 'dark' ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-black/5')
                          }`}
                      >
                          Preview
                      </button>
                  )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto">
                  {viewMode === 'output' ? (
                      <div className="code-block h-full">
                          <pre className={`h-full p-6 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-800'}`}>
                              <code>{output || 'Output from the AI will appear here...'}</code>
                          </pre>
                      </div>
                  ) : (
                      <iframe
                          srcDoc={previewCode || ''}
                          title="Code Preview"
                          sandbox="allow-scripts"
                          className="w-full h-full border-0 bg-white"
                      />
                  )}
              </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CodeCanvas;