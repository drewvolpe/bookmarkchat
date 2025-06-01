'use client';

import React, { useState } from 'react';
import { useStore } from '@/store';
import { cn } from '@/utils/cn';
import { formatMessage } from '@/utils/formatMessage';

export default function ChatView() {
  const [input, setInput] = useState('');
  const { conversations, currentConversationId, addMessage, isLoading, error } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await addMessage(input);
    setInput('');
  };

  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentConversation?.messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <div
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-4 py-2',
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                )}
              >
                {formatMessage(message.content)}
              </div>
            </div>
            {message.role === 'assistant' && message.relevantBookmarks && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
                  <div className="text-sm font-medium mb-2">Relevant Bookmarks:</div>
                  <div className="space-y-2">
                    {message.relevantBookmarks.map((bookmark, index) => (
                      <div key={index} className="text-sm space-y-1">
                        <div>
                          <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600 underline"
                          >
                            {bookmark.title}
                          </a>
                          <span className="text-gray-500 dark:text-gray-400 ml-2">
                            ({(bookmark.similarity * 100).toFixed(1)}% match)
                          </span>
                        </div>
                        {bookmark.description && (
                          <div className="text-gray-600 dark:text-gray-300">
                            {bookmark.description}
                          </div>
                        )}
                        {bookmark.tags && bookmark.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {bookmark.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {bookmark.timestamp && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Saved: {new Date(bookmark.timestamp).toLocaleString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
              Thinking...
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center">
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100">
              {error}
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
} 