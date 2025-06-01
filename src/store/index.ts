import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Bookmark, Conversation, Message, SearchFilters, UIState } from '@/types';
import { Store } from '@/types/store';
import { v4 as uuidv4 } from 'uuid';

interface ChatState {
  conversations: Conversation[];
  currentConversation: string | null;
  isLoading: boolean;
  error: string | null;
  addMessage: (message: Message) => void;
  createConversation: (title: string) => void;
  setCurrentConversation: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

interface BookmarkState {
  bookmarks: Bookmark[];
  filters: SearchFilters;
  searchQuery: string;
  selectedBookmark: string | null;
  setBookmarks: (bookmarks: Bookmark[]) => void;
  setFilters: (filters: SearchFilters) => void;
  setSearchQuery: (query: string) => void;
  setSelectedBookmark: (id: string | null) => void;
}

interface AppState extends ChatState, BookmarkState {
  ui: UIState;
  setTheme: (theme: 'light' | 'dark') => void;
  setSidebarOpen: (open: boolean) => void;
  setView: (view: 'chat' | 'bookmarks' | 'settings') => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      conversations: [],
      currentConversationId: null,
      bookmarks: [],
      settings: {
        apiKey: '',
        model: 'gpt-4',
        temperature: 0.7,
      },
      ui: {
        view: 'chat',
        isSidebarOpen: true,
        theme: 'light',
      },
      searchQuery: '',
      filters: [],
      isLoading: false,
      error: null,

      addMessage: async (content: string) => {
        set((state) => ({ isLoading: true, error: null }));

        try {
          // Add user message
          const userMessage = {
            id: uuidv4(),
            role: 'user' as const,
            content,
            timestamp: Date.now(),
          };

          set((state) => {
            if (!state.currentConversationId) {
              const newConversationId = uuidv4();
              return {
                conversations: [
                  {
                    id: newConversationId,
                    messages: [userMessage],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                  },
                ],
                currentConversationId: newConversationId,
              };
            }

            return {
              conversations: state.conversations.map((conv) =>
                conv.id === state.currentConversationId
                  ? {
                      ...conv,
                      messages: [...conv.messages, userMessage],
                      updatedAt: Date.now(),
                    }
                  : conv
              ),
            };
          });

          // Get AI response
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [{ role: 'user', content }],
              bookmarks: useStore.getState().bookmarks,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to get AI response');
          }

          const { message, relevantBookmarks } = await response.json();

          // Add AI message
          const aiMessage = {
            id: uuidv4(),
            role: 'assistant' as const,
            content: message.content,
            timestamp: Date.now(),
            relevantBookmarks
          };

          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === state.currentConversationId
                ? {
                    ...conv,
                    messages: [...conv.messages, aiMessage],
                    updatedAt: Date.now(),
                  }
                : conv
            ),
            isLoading: false,
          }));
        } catch (error) {
          set((state) => ({
            error: error instanceof Error ? error.message : 'An error occurred',
            isLoading: false,
          }));
        }
      },

      createConversation: () =>
        set((state) => {
          const newConversationId = uuidv4();
          return {
            conversations: [
              {
                id: newConversationId,
                messages: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
              ...state.conversations,
            ],
            currentConversationId: newConversationId,
          };
        }),

      addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) =>
        set((state) => ({
          bookmarks: [
            {
              ...bookmark,
              id: uuidv4(),
              createdAt: Date.now(),
            },
            ...state.bookmarks,
          ],
        })),

      updateSettings: (newSettings: Partial<Settings>) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        })),

      setView: (view: UIState['view']) =>
        set((state) => ({
          ui: {
            ...state.ui,
            view,
          },
        })),

      toggleSidebar: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            isSidebarOpen: !state.ui.isSidebarOpen,
          },
        })),

      toggleTheme: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            theme: state.ui.theme === 'light' ? 'dark' : 'light',
          },
        })),

      setSearchQuery: (query: string) =>
        set({
          searchQuery: query,
        }),

      setFilters: (filters: string[]) =>
        set({
          filters,
        }),
    }),
    {
      name: 'bookmark-chat-storage',
      partialize: (state) => ({
        ui: state.ui,
        settings: state.settings,
      }),
    }
  )
); 