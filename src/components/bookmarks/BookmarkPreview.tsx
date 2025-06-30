'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface BookmarkPreviewProps {
  url: string;
  title: string;
  children: React.ReactNode;
}

export default function BookmarkPreview({ url, title, children }: BookmarkPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previewRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShowPreview(true);
    }, 500); // 500ms delay before showing preview
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowPreview(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      
      {showPreview && (
        <div
          ref={previewRef}
          className={cn(
            "absolute z-50 w-96 h-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600",
            "transform -translate-x-1/2 left-1/2 -top-2 -translate-y-full",
            "overflow-hidden"
          )}
        >
          {/* Arrow pointing down */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200 dark:border-t-gray-600"></div>
          
          {/* Header with title and URL */}
          <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 border-b border-gray-200 dark:border-gray-600">
            <h4 className="font-semibold text-xs text-gray-900 dark:text-white truncate">
              {title}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {url}
            </p>
          </div>
          
          {/* Website preview iframe */}
          <div className="w-full h-full">
            <iframe
              src={url}
              className="w-full h-full border-0"
              title={`Preview of ${title}`}
              sandbox="allow-scripts allow-same-origin"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
} 