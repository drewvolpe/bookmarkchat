import React from 'react';

export function formatMessage(content: string): React.ReactNode[] {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Split the content by URLs
  const parts = content.split(urlRegex);
  
  // Map each part to either text or a link
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 underline"
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
} 