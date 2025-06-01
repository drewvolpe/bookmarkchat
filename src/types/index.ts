export interface Bookmark {
  id: string;
  url: string;
  title: string;
  tags: string[];
  createdAt: Date;
  lastAccessed: Date;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  sources?: BookmarkReference[];
}

export interface BookmarkReference {
  bookmarkId: string;
  title: string;
  url: string;
  relevance: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  tags?: string[];
  dateRange?: [Date, Date];
  domains?: string[];
}

export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  view: 'chat' | 'bookmarks' | 'settings';
} 