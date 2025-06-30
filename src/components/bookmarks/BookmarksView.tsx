'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store';
import { cn } from '@/utils/cn';
import BookmarkPreview from './BookmarkPreview';

export default function BookmarksView() {
  const { bookmarks, searchQuery, setSearchQuery } = useStore();
  const [filteredBookmarks, setFilteredBookmarks] = useState(bookmarks);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBookmarks(bookmarks);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = bookmarks.filter(bookmark => {
      const titleMatch = bookmark.title.toLowerCase().includes(query);
      const urlMatch = bookmark.url.toLowerCase().includes(query);
      const descriptionMatch = bookmark.description?.toLowerCase().includes(query) || false;
      const tagsMatch = bookmark.tags.some(tag => tag.toLowerCase().includes(query));
      
      return titleMatch || urlMatch || descriptionMatch || tagsMatch;
    });

    setFilteredBookmarks(filtered);
  }, [searchQuery, bookmarks]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search bookmarks by title, URL, description, or tags..."
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {filteredBookmarks.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            {searchQuery ? 'No bookmarks found matching your search.' : 'No bookmarks available.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {bookmark.title}
                </h3>
                <BookmarkPreview url={bookmark.url} title={bookmark.title}>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                  >
                    {bookmark.url}
                  </a>
                </BookmarkPreview>
                {bookmark.description && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {bookmark.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {bookmark.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {bookmark.lastAccessed && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Last accessed: {new Date(bookmark.lastAccessed).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 