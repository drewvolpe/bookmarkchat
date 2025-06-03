import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const embeddingsDir = path.join(process.cwd(), 'data', 'embeddings');
    const bookmarks = [];

    if (!fs.existsSync(embeddingsDir)) {
      console.error('No embeddings directory found');
      return NextResponse.json({ bookmarks: [] });
    }

    const files = fs.readdirSync(embeddingsDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const content = fs.readFileSync(path.join(embeddingsDir, file), 'utf-8');
          const bookmark = JSON.parse(content);
          bookmarks.push({
            id: bookmark.url, // Use URL as ID since it's unique
            url: bookmark.url,
            title: bookmark.title,
            description: bookmark.description || '',
            tags: bookmark.tags || [],
            createdAt: Date.now(), // Use current timestamp since we don't have original creation date
            lastAccessed: new Date().toISOString(),
          });
        } catch (error) {
          console.error(`Error loading ${file}:`, error);
        }
      }
    }

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    return NextResponse.json({ error: 'Failed to load bookmarks' }, { status: 500 });
  }
} 