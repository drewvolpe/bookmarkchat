import os
import json
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class PinboardFetcher:
    def __init__(self):
        self.token = os.getenv('PINBOARD_TOKEN')
        if not self.token:
            raise ValueError("PINBOARD_TOKEN not found in environment variables")
        
        self.api_base = "https://api.pinboard.in/v1"
        self.cache_dir = Path(__file__).parent.parent.parent / "data" / "cache"
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.bookmarks_file = self.cache_dir / "bookmarks.json"

    def fetch_bookmarks(self, force=False):
        """Fetch all bookmarks from Pinboard API."""
        if not force and self.bookmarks_file.exists():
            print("Using cached bookmarks. Use --force to fetch fresh data.")
            return self._load_cached_bookmarks()

        url = f"{self.api_base}/posts/all"
        params = {
            "auth_token": self.token,
            "format": "json"
        }

        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            bookmarks = response.json()
            
            # Save to cache
            with open(self.bookmarks_file, 'w') as f:
                json.dump(bookmarks, f, indent=2)
            
            print(f"Successfully fetched {len(bookmarks)} bookmarks")
            return bookmarks

        except requests.exceptions.RequestException as e:
            print(f"Error fetching bookmarks: {e}")
            if self.bookmarks_file.exists():
                print("Falling back to cached bookmarks")
                return self._load_cached_bookmarks()
            raise

    def _load_cached_bookmarks(self):
        """Load bookmarks from cache file."""
        with open(self.bookmarks_file, 'r') as f:
            return json.load(f)

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Fetch bookmarks from Pinboard")
    parser.add_argument("--force", action="store_true", help="Force fresh fetch ignoring cache")
    args = parser.parse_args()

    fetcher = PinboardFetcher()
    bookmarks = fetcher.fetch_bookmarks(force=args.force)
    print(f"Total bookmarks: {len(bookmarks)}")

if __name__ == "__main__":
    main() 