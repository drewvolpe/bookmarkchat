'use client';

import React, { useEffect } from 'react';
import { useStore } from '@/store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { ui } = useStore();

  useEffect(() => {
    const root = window.document.documentElement;
    if (ui.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [ui.theme]);

  return <>{children}</>;
} 