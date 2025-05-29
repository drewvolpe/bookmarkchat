import os
import json
import hashlib
from pathlib import Path
from newspaper import Article
from urllib.parse import urlparse
import time
from typing import Optional, Dict, Any, Set
from datetime import datetime

class PageFetcher:
    def __init__(self):
        self.cache_dir = Path(__file__).parent.parent.parent / "data" / "cache" / "pages"
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.bookmarks_file = Path(__file__).parent.parent.parent / "data" / "cache" / "bookmarks.json"
        self.progress_file = self.cache_dir / "fetch_progress.json"
        self.processed_urls: Set[str] = set()
        self.load_progress()

    def load_progress(self):
        """Load progress from the progress file."""
        if self.progress_file.exists():
            with open(self.progress_file, 'r') as f:
                data = json.load(f)
                self.processed_urls = set(data.get('processed_urls', []))
                print(f"Loaded progress: {len(self.processed_urls)} URLs already processed")

    def save_progress(self):
        """Save current progress to the progress file."""
        with open(self.progress_file, 'w') as f:
            json.dump({
                'processed_urls': list(self.processed_urls),
                'last_updated': datetime.now().isoformat()
            }, f, indent=2)

    def _get_cache_path(self, url: str) -> Path:
        """Generate cache file path for a URL."""
        url_hash = hashlib.md5(url.encode()).hexdigest()
        return self.cache_dir / f"{url_hash}.txt"

    def fetch_page(self, url: str, force: bool = False) -> Optional[Dict[str, Any]]:
        """Fetch and extract content from a webpage."""
        cache_path = self._get_cache_path(url)
        
        # Skip if already processed and not forcing refresh
        if not force and url in self.processed_urls:
            print(f"Skipping already processed URL: {url}")
            return None

        try:
            # Initialize article
            article = Article(url)
            article.download()
            article.parse()
            
            # Extract content
            content = {
                'url': url,
                'title': article.title,
                'text': article.text,
                'authors': article.authors,
                'publish_date': article.publish_date.isoformat() if article.publish_date else None,
                'top_image': article.top_image,
                'timestamp': time.time()
            }
            
            # Save to cache
            with open(cache_path, 'w', encoding='utf-8') as f:
                json.dump(content, f, indent=2, ensure_ascii=False)
            
            # Mark as processed
            self.processed_urls.add(url)
            self.save_progress()
            
            return content

        except Exception as e:
            print(f"Error fetching {url}: {str(e)}")
            return None

    def fetch_all_bookmarks(self, force: bool = False, limit: Optional[int] = None) -> None:
        """Fetch content for all bookmarks."""
        if not self.bookmarks_file.exists():
            raise FileNotFoundError("bookmarks.json not found. Run pinboard_fetcher.py first.")

        with open(self.bookmarks_file, 'r') as f:
            bookmarks = json.load(f)

        if limit:
            bookmarks = bookmarks[:limit]

        total = len(bookmarks)
        for i, bookmark in enumerate(bookmarks, 1):
            # Use 'href' for Pinboard bookmarks
            url = bookmark.get('href', bookmark.get('url', ''))
            if not url:
                print(f"Skipping bookmark with no URL: {bookmark}")
                continue

            print(f"[{i}/{total}] Fetching {url}")
            self.fetch_page(url, force=force)
            # Be nice to servers
            time.sleep(0.2)

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Fetch and cache webpage content")
    parser.add_argument("--force", action="store_true", help="Force refresh all pages")
    parser.add_argument("--limit", type=int, help="Limit number of pages to fetch")
    args = parser.parse_args()

    fetcher = PageFetcher()
    fetcher.fetch_all_bookmarks(force=args.force, limit=args.limit)

if __name__ == "__main__":
    main() 