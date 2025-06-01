'use client';

import React from 'react';
import { useStore } from '@/store';
import { cn } from '@/utils/cn';
import Header from './Header';
import Sidebar from './Sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ui } = useStore();

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main
          className={cn(
            'flex-1 overflow-y-auto transition-all duration-300',
            ui.isSidebarOpen ? 'ml-64' : 'ml-0'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
} 