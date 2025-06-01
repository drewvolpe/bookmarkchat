'use client';

import React from 'react';
import {
  ChatBubbleLeftIcon,
  BookmarkIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useStore } from '@/store';
import { cn } from '@/utils/cn';

const navigation = [
  {
    name: 'Chat',
    icon: ChatBubbleLeftIcon,
    view: 'chat' as const,
  },
  {
    name: 'Bookmarks',
    icon: BookmarkIcon,
    view: 'bookmarks' as const,
  },
  {
    name: 'Settings',
    icon: Cog6ToothIcon,
    view: 'settings' as const,
  },
];

export default function Sidebar() {
  const { ui, setView } = useStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300',
        ui.isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <nav className="p-4 space-y-2">
        {navigation.map((item) => (
          <button
            key={item.name}
            onClick={() => setView(item.view)}
            className={cn(
              'w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors',
              ui.view === item.view
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            <item.icon className="h-6 w-6" />
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
} 