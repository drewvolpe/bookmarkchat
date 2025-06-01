import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to calculate cosine similarity
function cosineSimilarity(a: number[], b: number[]) {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Function to load embeddings from files
function loadEmbeddings() {
  const embeddingsDir = path.join(process.cwd(), 'data', 'embeddings');
  const bookmarks = [];

  if (!fs.existsSync(embeddingsDir)) {
    console.error('No embeddings directory found');
    return [];
  }

  const files = fs.readdirSync(embeddingsDir);
  for (const file of files) {
    if (file.endsWith('.json')) {
      try {
        const content = fs.readFileSync(path.join(embeddingsDir, file), 'utf-8');
        const bookmark = JSON.parse(content);
        bookmarks.push(bookmark);
      } catch (error) {
        console.error(`Error loading ${file}:`, error);
      }
    }
  }

  return bookmarks;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1];

    // Load all bookmarks with their embeddings
    const bookmarks = loadEmbeddings();
    if (bookmarks.length === 0) {
      return NextResponse.json(
        { error: 'No bookmarks found. Please run the embedder first.' },
        { status: 404 }
      );
    }

    // Get embedding for the user's message
    const queryEmbedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: lastUserMessage.content,
    }).then(response => response.data[0].embedding);

    // Find most relevant chunks across all bookmarks
    const allChunks = [];
    for (const bookmark of bookmarks) {
      for (const embeddingData of bookmark.embeddings) {
        const similarity = cosineSimilarity(queryEmbedding, embeddingData.embedding);
        allChunks.push({
          title: bookmark.title,
          url: bookmark.url,
          chunk: embeddingData.chunk,
          similarity,
        });
      }
    }

    // Sort chunks by similarity and take top 5
    const relevantChunks = allChunks
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    if (relevantChunks.length === 0) {
      return NextResponse.json(
        { error: 'No relevant content found in bookmarks.' },
        { status: 404 }
      );
    }

    // Create a system message that includes context from relevant chunks
    const systemMessage = {
      role: 'system',
      content: `You are a helpful assistant that can answer questions about the user's bookmarks. 
      Here are the most relevant parts of the bookmarks for the current query:
      ${relevantChunks.map((chunk) => `
Title: ${chunk.title}
URL: ${chunk.url}
Content: ${chunk.chunk}
---`).join('\n')}
      
      Please provide helpful responses based on these bookmark contents and the user's questions.
      If the bookmarks don't contain relevant information for the query, say so politely.
      Always include the relevant URLs in your response so the user can visit them.`,
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
    });

    // Format the relevant bookmarks for display
    const relevantBookmarks = relevantChunks.map(chunk => {
      let bookmarkData;
      try {
        // Try to parse the chunk as JSON
        bookmarkData = JSON.parse(chunk.chunk);
      } catch (error) {
        // If parsing fails, use the chunk text directly
        bookmarkData = {
          text: chunk.chunk,
          tags: [],
          timestamp: null
        };
      }

      return {
        title: chunk.title,
        url: chunk.url,
        description: bookmarkData.text || '',
        tags: bookmarkData.tags || [],
        timestamp: bookmarkData.timestamp ? new Date(bookmarkData.timestamp * 1000).toISOString() : null,
        similarity: chunk.similarity
      };
    });

    return NextResponse.json({
      message: completion.choices[0].message,
      relevantBookmarks
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chat request' },
      { status: 500 }
    );
  }
} 