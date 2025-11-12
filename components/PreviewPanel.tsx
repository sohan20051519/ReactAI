
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, ExternalLink, FileText, Bot } from 'lucide-react';
import { PreviewContent, ImagePreviewData, CodePreviewData, PresentationPreviewData } from '../types';

interface PreviewPanelProps {
    content: PreviewContent;
    onClose: () => void;
}

const ImagePreview: React.FC<{ data: ImagePreviewData }> = ({ data }) => (
    <div className="flex flex-col h-full">
        <div className="p-4 bg-black/10 rounded-lg">
            <p className="text-sm text-text-secondary">Prompt:</p>
            <p className="font-medium text-text-primary">{data.prompt}</p>
        </div>
        <div className="flex-1 flex items-center justify-center mt-4">
            <motion.img
                src={data.url}
                alt={data.prompt}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            />
        </div>
    </div>
);

const CodePreview: React.FC<{ data: CodePreviewData }> = ({ data }) => {
    const [activeTab, setActiveTab] = useState<'preview' | 'explanation' | 'code'>('preview');

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 flex items-center border-b border-highlight-color">
                {['preview', 'explanation', 'code'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 text-sm font-medium transition-colors capitalize ${
                            activeTab === tab
                                ? 'text-text-primary border-b-2 border-accent-start'
                                : 'text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="flex-1 mt-4 overflow-auto">
                {activeTab === 'preview' && (
                    <div className="w-full h-full rounded-lg overflow-hidden bg-white">
                        <iframe
                            srcDoc={data.code}
                            title="Code Preview"
                            sandbox="allow-scripts"
                            className="w-full h-full border-0"
                        />
                    </div>
                )}
                {activeTab === 'explanation' && (
                    <div className="markdown-content p-2">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.explanation}</ReactMarkdown>
                    </div>
                )}
                {activeTab === 'code' && (
                    <div className="bg-black/20 rounded-lg p-4 h-full overflow-auto">
                        <pre className="text-sm"><code className="language-html whitespace-pre-wrap">{data.code}</code></pre>
                    </div>
                )}
            </div>
        </div>
    );
};

const PresentationPreview: React.FC<{ data: PresentationPreviewData }> = ({ data }) => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-8 glass-panel rounded-2xl"
        >
            <FileText size={48} className="mx-auto text-accent-end" />
            <h3 className="text-xl font-bold mt-4">Presentation Ready!</h3>
            <p className="text-text-secondary mt-2">Your presentation has been generated and downloaded.</p>
            <div className="mt-6 text-left bg-black/10 p-4 rounded-lg w-full max-w-sm">
                <p className="text-sm"><strong className="font-semibold text-text-primary">File:</strong> <span className="text-text-secondary">{data.fileName}.pptx</span></p>
                <p className="text-sm mt-2"><strong className="font-semibold text-text-primary">Title:</strong> <span className="text-text-secondary">{data.title}</span></p>
                <p className="text-sm mt-2"><strong className="font-semibold text-text-primary">Slides:</strong> <span className="text-text-secondary">{data.slidesCount} content slides</span></p>
            </div>
        </motion.div>
    </div>
);

const PreviewPanel: React.FC<PreviewPanelProps> = ({ content, onClose }) => {
    if (!content) return null;

    const renderContent = () => {
        switch (content.type) {
            case 'image': return <ImagePreview data={content.data} />;
            case 'code': return <CodePreview data={content.data} />;
            case 'presentation': return <PresentationPreview data={content.data} />;
            default: return null;
        }
    };

    const titleMap = {
        image: 'Image Preview',
        code: 'Code Preview',
        presentation: 'Presentation Generated'
    };

    return (
        <div className="h-full flex flex-col glass-panel border-l border-highlight-color z-30">
            <header className="flex-shrink-0 p-4 flex items-center justify-between border-b border-highlight-color">
                <h2 className="text-lg font-bold text-text-primary">{titleMap[content.type]}</h2>
                <motion.button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-black/20 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close preview"
                >
                    <X size={20} className="text-text-secondary" />
                </motion.button>
            </header>
            <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default PreviewPanel;
