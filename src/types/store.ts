export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  relevantBookmarks?: Bookmark[];
}

export interface Conversation {
  id: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
  tags: string[];
  createdAt: number;
  lastAccessed: Date;
  similarity?: number;
}

export interface Settings {
  apiKey: string;
  model: string;
  temperature: number;
}

export interface UIState {
  view: 'chat' | 'bookmarks' | 'settings';
  isSidebarOpen: boolean;
  theme: 'light' | 'dark';
}

export interface Store {
  conversations: Conversation[];
  currentConversationId: string | null;
  bookmarks: Bookmark[];
  settings: Settings;
  ui: UIState;
  searchQuery: string;
  filters: string[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addMessage: (content: string) => Promise<void>;
  createConversation: () => void;
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'lastAccessed' | 'similarity'>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  setView: (view: UIState['view']) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: string[]) => void;
} 