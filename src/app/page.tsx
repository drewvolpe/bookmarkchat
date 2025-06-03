'use client';

import React, { useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useStore } from '@/store';
import ChatView from '@/components/chat/ChatView';
import BookmarksView from '@/components/bookmarks/BookmarksView';
import SettingsView from '@/components/settings/SettingsView';

export default function Home() {
  const { ui, bookmarks, setBookmarks } = useStore();

  useEffect(() => {
    // Load bookmarks from embeddings directory
    const loadBookmarks = async () => {
      try {
        const response = await fetch('/api/bookmarks');
        if (!response.ok) {
          throw new Error('Failed to load bookmarks');
        }
        const data = await response.json();
        setBookmarks(data);
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    };

    if (bookmarks.length === 0) {
      loadBookmarks();
    }
  }, [bookmarks.length, setBookmarks]);

  return (
    <MainLayout>
      {ui.view === 'chat' && <ChatView />}
      {ui.view === 'bookmarks' && <BookmarksView />}
      {ui.view === 'settings' && <SettingsView />}
    </MainLayout>
  );
} 