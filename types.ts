
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  image?: {
    url: string; // data URL or blob URL
  };
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: number;
  messages: ChatMessage[];
  pinned: boolean;
}

export type Theme = 'dark' | 'light';

export type InputMode = 'chat' | 'generate' | 'code' | 'presentation';

export interface ImagePreviewData {
  url: string;
  prompt: string;
}

export interface CodePreviewData {
  code: string;
  explanation: string;
  prompt: string;
}

export interface PresentationPreviewData {
    fileName: string;
    title: string;
    slidesCount: number;
}

export type PreviewContent =
  | { type: 'image'; data: ImagePreviewData }
  | { type: 'code'; data: CodePreviewData }
  | { type: 'presentation'; data: PresentationPreviewData }
  | null;