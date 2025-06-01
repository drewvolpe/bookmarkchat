'use client';

import React from 'react';
import { Bars3Icon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useStore } from '@/store';

export default function Header() {
  const { ui, toggleSidebar, toggleTheme } = useStore();

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
      </button>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {ui.theme === 'light' ? (
          <MoonIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        ) : (
          <SunIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>
    </header>
  );
} 