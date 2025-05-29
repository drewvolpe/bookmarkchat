import os
import json
import numpy as np
from pathlib import Path
from typing import List, Dict
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_project_root() -> Path:
    """Get the absolute path to the project root directory."""
    return Path(__file__).parent.parent.parent.absolute()

def load_embeddings() -> List[Dict]:
    """Load all embeddings from the embeddings directory."""
    embeddings_dir = get_project_root() / "data" / "embeddings"
    if not embeddings_dir.exists():
        print("No embeddings found. Please run the embedder first.")
        return []
    
    bookmarks = []
    for file in embeddings_dir.glob("*.json"):
        try:
            with open(file, 'r') as f:
                bookmark_data = json.load(f)
                bookmarks.append(bookmark_data)
        except Exception as e:
            print(f"Error loading {file}: {str(e)}")
    
    return bookmarks

def get_query_embedding(query: str) -> List[float]:
    """Get embedding for the search query."""
    try:
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=query
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error getting query embedding: {str(e)}")
        return None

def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Calculate cosine similarity between two vectors."""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def find_relevant_chunks(bookmarks: List[Dict], query_embedding: List[float], max_chunks: int = 5) -> List[Dict]:
    """Find the most relevant chunks based on the query embedding."""
    all_chunks = []
    
    for bookmark in bookmarks:
        for embedding_data in bookmark['embeddings']:
            similarity = cosine_similarity(query_embedding, embedding_data['embedding'])
            all_chunks.append({
                'title': bookmark['title'],
                'url': bookmark['url'],
                'chunk': embedding_data['chunk'],
                'similarity': similarity
            })
    
    # Sort by similarity and return top chunks
    all_chunks.sort(key=lambda x: x['similarity'], reverse=True)
    return all_chunks[:max_chunks]

def chat_with_bookmarks(bookmarks: List[Dict], query: str):
    """Chat with the bookmarks using OpenAI's chat model."""
    # Get query embedding
    query_embedding = get_query_embedding(query)
    if not query_embedding:
        print("Error: Could not get query embedding")
        return

    # Find most relevant chunks
    relevant_chunks = find_relevant_chunks(bookmarks, query_embedding)
    if not relevant_chunks:
        print("No relevant content found in bookmarks.")
        return

    # Prepare context from relevant chunks
    context = "Here are the most relevant parts of my bookmarks:\n\n"
    for chunk in relevant_chunks:
        context += f"Title: {chunk['title']}\n"
        context += f"URL: {chunk['url']}\n"
        context += f"Content: {chunk['chunk']}\n\n"

    # Create chat messages
    messages = [
        {"role": "system", "content": "You are a helpful assistant that answers questions based on the provided bookmark content. If the content doesn't contain relevant information, say so."},
        {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"}
    ]

    try:
        # Get response from OpenAI
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )
        
        # Print the response
        print("\nResponse:")
        print(response.choices[0].message.content)
        
        # Print the top 5 most relevant bookmarks
        print("\nTop 5 Most Relevant Bookmarks:")
        print("-" * 80)
        for i, chunk in enumerate(relevant_chunks, 1):
            print(f"\n{i}. Title: {chunk['title']}")
            print(f"   URL: {chunk['url']}")
            print(f"   Content: {chunk['chunk'][:200]}...")  # Show first 200 chars of content
            print("-" * 80)
            
    except Exception as e:
        print(f"Error: {str(e)}")

def main():
    # Load embeddings
    print("Loading embeddings...")
    bookmarks = load_embeddings()
    if not bookmarks:
        return
    
    print(f"Loaded {len(bookmarks)} bookmarks")
    
    # Interactive chat loop
    print("\nChat with your bookmarks! Type 'quit' to exit.")
    while True:
        query = input("\nYour question: ").strip()
        if query.lower() == 'quit':
            break
            
        if not query:
            continue
            
        chat_with_bookmarks(bookmarks, query)

if __name__ == "__main__":
    main() 