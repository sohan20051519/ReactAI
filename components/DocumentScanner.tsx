import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileUp, FileText, X } from 'lucide-react';
import { Theme } from '../types';
import { extractTextFromImage } from '../services/geminiService';

interface FileAnalyzerProps {
  theme: Theme;
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

const FileAnalyzer: React.FC<FileAnalyzerProps> = ({ theme }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (file) {
      setUploadedFile(file);
      setError('');
      setExtractedText('');
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const processFile = async () => {
    if (!uploadedFile) return;
    setIsLoading(true);
    setExtractedText('');
    setError('');
    try {
      const { data, mimeType } = await fileToBase64(uploadedFile);
      const result = await extractTextFromImage(data, mimeType);
      setExtractedText(result);
    } catch (err) {
      setError('Failed to extract text from the document.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setExtractedText('');
    setError('');
    setIsLoading(false);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-8 overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-4xl mx-auto flex flex-col items-center"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">File Analyzer</h2>
        
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full aspect-video max-w-2xl rounded-3xl backdrop-blur-xl flex items-center justify-center p-4 transition-all duration-300 relative overflow-hidden border-2 border-dashed cursor-pointer ${
            isDragging
              ? 'border-[var(--primary-color)]'
              : (theme === 'dark' ? 'border-slate-700 hover:border-slate-500' : 'border-slate-300 hover:border-slate-400')
          } ${
           theme === 'dark'
            ? 'bg-slate-900/60 shadow-glass-inset-dark'
            : 'bg-white/40 shadow-glass-inset-light'
          }`}
        >
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
            
            {!uploadedFile && (
                <div className="flex flex-col items-center gap-4 text-slate-400 pointer-events-none">
                    <FileUp size={64} strokeWidth={1} />
                    <p className="text-center">Drag & drop a file here, or click to select</p>
                    {error && <p className="text-red-400 mt-2">{error}</p>}
                </div>
            )}
            
            {uploadedFile && (
                <div className="w-full h-full flex flex-col items-center justify-center">
                    {previewUrl ? (
                        <img src={previewUrl} alt="File preview" className="max-w-full max-h-full object-contain rounded-lg" />
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-slate-400">
                           <FileText size={64} strokeWidth={1} />
                           <p className="font-medium text-center">{uploadedFile.name}</p>
                        </div>
                    )}
                </div>
            )}

        </div>
        
        <div className="flex items-center gap-4 my-6">
            {uploadedFile && (
                <>
                    <motion.button 
                        onClick={processFile}
                        disabled={isLoading}
                        className="px-6 py-3 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] text-white flex items-center gap-2 disabled:opacity-50"
                        whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}
                    > 
                        {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FileText size={20}/>}
                        {isLoading ? 'Analyzing...' : 'Extract Text'}
                    </motion.button>
                    <motion.button onClick={reset} className="px-6 py-3 rounded-full bg-red-500 text-white flex items-center gap-2" whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}> <X size={20}/> Clear </motion.button>
                </>
            )}
        </div>

        {(isLoading || extractedText) && (
             <div className={`w-full max-w-2xl rounded-3xl backdrop-blur-xl p-6 transition-all duration-300 ${
                theme === 'dark'
                    ? 'bg-slate-900/60 shadow-glass-inset-dark text-slate-300'
                    : 'bg-white/40 shadow-glass-inset-light text-slate-800'
            }`}>
                 {isLoading && <p>Analyzing document...</p>}
                 {extractedText && <div className="whitespace-pre-wrap">{extractedText}</div>}
             </div>
        )}

      </motion.div>
    </div>
  );
};

export default FileAnalyzer;