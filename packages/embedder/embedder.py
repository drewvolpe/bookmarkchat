import os
import json
import time
import hashlib
import argparse
from pathlib import Path
from typing import List, Dict, Set
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_project_root() -> Path:
    """Get the absolute path to the project root directory."""
    return Path(__file__).parent.parent.parent.absolute()

def get_progress_file() -> Path:
    """Get the absolute path to the progress file."""
    return get_project_root() / "data" / "cache" / "embedder_progress.json"

def load_bookmarks(file_path: str) -> List[Dict]:
    """Load bookmarks from a JSON file."""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Bookmarks file not found at {file_path}")
        return []
    except json.JSONDecodeError:
        print(f"Error decoding JSON from {file_path}")
        return []

def load_progress() -> Set[str]:
    """Load the set of processed URLs from progress file."""
    progress_file = get_progress_file()
    print(f"Looking for progress file at: {progress_file}")
    
    if not progress_file.exists():
        print("Progress file not found")
        return set()
    
    try:
        with open(progress_file, 'r') as f:
            urls = set(json.load(f))
            print(f"Loaded {len(urls)} URLs from progress file")
            return urls
    except (json.JSONDecodeError, FileNotFoundError) as e:
        print(f"Error loading progress file: {str(e)}")
        return set()

def save_progress(processed_urls: Set[str]):
    """Save the set of processed URLs to progress file."""
    progress_file = get_progress_file()
    progress_file.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"Saving progress to: {progress_file}")
    with open(progress_file, 'w') as f:
        json.dump(list(processed_urls), f)
    print(f"Saved {len(processed_urls)} URLs to progress file")

def hash_url(url: str) -> str:
    """Create a consistent hash from a URL."""
    return hashlib.md5(url.encode()).hexdigest()

def load_page_content(url_hash: str) -> str:
    """Load page content from cache."""
    cache_path = get_project_root() / "data" / "cache" / "pages" / f"{url_hash}.txt"
    if not cache_path.exists():
        return ""
    with open(cache_path, 'r', encoding='utf-8') as f:
        return f.read()

def chunk_text(text: str, chunk_size: int = 1000) -> List[str]:
    """Split text into chunks of approximately chunk_size characters."""
    words = text.split()
    chunks = []
    current_chunk = []
    current_size = 0
    
    for word in words:
        word_size = len(word) + 1  # +1 for space
        if current_size + word_size > chunk_size and current_chunk:
            chunks.append(' '.join(current_chunk))
            current_chunk = []
            current_size = 0
        current_chunk.append(word)
        current_size += word_size
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks

def get_embedding(text: str) -> List[float]:
    """Get embedding for a text chunk."""
    try:
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error getting embedding: {str(e)}")
        return None

def process_bookmarks(bookmarks: List[Dict], batch_size: int = 5):
    """Process bookmarks in batches to avoid rate limits."""
    total = len(bookmarks)
    embeddings_dir = get_project_root() / "data" / "embeddings"
    embeddings_dir.mkdir(parents=True, exist_ok=True)
    
    # Load progress
    processed_urls = load_progress()
    print(f"Found {len(processed_urls)} previously processed URLs")
    
    for i in range(0, total, batch_size):
        batch = bookmarks[i:i + batch_size]
        print(f"\nProcessing batch {i//batch_size + 1}/{(total + batch_size - 1)//batch_size}")
        
        batch_processed = False  # Track if we processed any URLs in this batch
        
        for bookmark in batch:
            # Use 'href' for Pinboard bookmarks
            url = bookmark.get('href', bookmark.get('url', ''))
            if not url:
                print(f"Skipping bookmark with no URL: {bookmark}")
                continue
            
            # Skip if already processed
            if url in processed_urls:
                print(f"Skipping already processed URL: {url}")
                continue
                
            url_hash = hash_url(url)
            content = load_page_content(url_hash)
            
            if not content:
                print(f"No content found for {url}")
                continue
            
            chunks = chunk_text(content)
            print(f"Processing {url} - {len(chunks)} chunks")
            
            embeddings = []
            for j, chunk in enumerate(chunks):
                print(f"  Chunk {j+1}/{len(chunks)}")
                embedding = get_embedding(chunk)
                if embedding:
                    embeddings.append({
                        'chunk': chunk,
                        'embedding': embedding
                    })
                time.sleep(0.2)  # Small delay between chunks
            
            if embeddings:
                output_file = embeddings_dir / f"{url_hash}.json"
                with open(output_file, 'w') as f:
                    json.dump({
                        'url': url,
                        'title': bookmark.get('description', bookmark.get('title', '')),
                        'embeddings': embeddings
                    }, f, indent=2)
                
                # Mark as processed
                processed_urls.add(url)
                save_progress(processed_urls)
                batch_processed = True  # We processed at least one URL in this batch
        
        # Only wait if we actually processed any URLs in this batch
        if batch_processed and i + batch_size < total:
            print("Waiting 2 seconds before next batch...")
            time.sleep(2)  # Reduced from 60 to 2 seconds

def clean_progress():
    """Remove the progress tracking file."""
    progress_file = get_progress_file()
    print(f"Attempting to clean progress file at: {progress_file}")
    if progress_file.exists():
        progress_file.unlink()
        print("Progress file cleaned.")
    else:
        print("No progress file found to clean.")

def main():
    # Set up argument parser
    parser = argparse.ArgumentParser(description='Process bookmarks and create embeddings.')
    parser.add_argument('--clean', action='store_true', help='Clean the progress state file before starting')
    args = parser.parse_args()

    # Clean progress if requested
    if args.clean:
        clean_progress()

    # Load bookmarks
    bookmarks_file = get_project_root() / "bookmarks.json"
    print(f"Loading bookmarks from: {bookmarks_file}")
    bookmarks = load_bookmarks(str(bookmarks_file))
    if not bookmarks:
        print("No bookmarks found. Please ensure bookmarks.json exists and contains valid bookmark data.")
        return
    
    print(f"Found {len(bookmarks)} bookmarks to process")
    process_bookmarks(bookmarks)

if __name__ == "__main__":
    main() 