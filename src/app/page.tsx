'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useStore } from '@/store';
import ChatView from '@/components/chat/ChatView';
import BookmarksView from '@/components/bookmarks/BookmarksView';
import SettingsView from '@/components/settings/SettingsView';

export default function Home() {
  const { ui } = useStore();

  return (
    <MainLayout>
      {ui.view === 'chat' && <ChatView />}
      {ui.view === 'bookmarks' && <BookmarksView />}
      {ui.view === 'settings' && <SettingsView />}
    </MainLayout>
  );
} 