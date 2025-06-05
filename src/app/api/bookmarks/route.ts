import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function cleanJsonString(str: string): string {
  // First, handle escaped characters
  let cleaned = str
    .replace(/\\n/g, ' ')  // Replace newlines with spaces
    .replace(/\\"/g, '"')  // Fix escaped quotes
    .replace(/\\\\/g, '\\') // Fix double escaped backslashes
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16))); // Handle unicode escapes

  // Then try to fix any remaining JSON issues
  try {
    // If it's already valid JSON, return it
    JSON.parse(cleaned);
    return cleaned;
  } catch (e) {
    // If not, try to fix common issues
    cleaned = cleaned
      .replace(/([^\\])"/g, '$1\\"') // Escape unescaped quotes
      .replace(/\n/g, ' ') // Replace any remaining newlines
      .replace(/\r/g, ' ') // Replace carriage returns
      .replace(/\t/g, ' ') // Replace tabs
      .replace(/\\/g, '\\\\') // Escape backslashes
      .replace(/"/g, '\\"') // Escape quotes
      .replace(/^/, '"') // Add opening quote
      .replace(/$/, '"'); // Add closing quote

    return cleaned;
  }
}

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
          const filePath = path.join(embeddingsDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          
          // First try to parse the outer JSON
          let data;
          try {
            data = JSON.parse(content);
          } catch (parseError) {
            console.error(`Error parsing outer JSON in ${file}:`, parseError);
            continue;
          }

          // Then try to parse the first chunk
          if (data.embeddings && data.embeddings.length > 0) {
            const firstChunk = data.embeddings[0];
            try {
              // Clean and parse the chunk
              const cleanChunk = cleanJsonString(firstChunk.chunk);
              const chunkData = JSON.parse(cleanChunk);
              
              // Clean the text content
              const cleanText = chunkData.text ? cleanJsonString(chunkData.text) : '';

              bookmarks.push({
                id: data.url,
                url: data.url,
                title: data.title,
                description: cleanText,
                tags: chunkData.tags || [],
                createdAt: Date.now(),
                lastAccessed: new Date().toISOString(),
              });
            } catch (chunkError) {
              console.error(`Error parsing chunk in ${file}:`, chunkError);
              // Try to extract basic info even if chunk parsing fails
              bookmarks.push({
                id: data.url,
                url: data.url,
                title: data.title,
                description: '',
                tags: [],
                createdAt: Date.now(),
                lastAccessed: new Date().toISOString(),
              });
            }
          }
        } catch (error) {
          console.error(`Error processing ${file}:`, error);
        }
      }
    }

    console.log(`Successfully loaded ${bookmarks.length} bookmarks`);
    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    return NextResponse.json({ error: 'Failed to load bookmarks' }, { status: 500 });
  }
} 