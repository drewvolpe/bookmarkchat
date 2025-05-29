# Bookmark Chat

Chat with your Pinboard.in bookmarks using AI. This application allows you to have natural conversations about your saved bookmarks and their content.

## Project Structure

```
/bookmark-chat-app
├── /apps
│   ├── /web            # Next.js frontend (chat UI) TODO
│   └── /api            # FastAPI backend service TODO
├── /packages
│   ├── /fetcher        # Shared logic to fetch/cache Pinboard + webpage content
│   └── /embedder       # Embedding & vector store logic
├── /data
│   └── /cache          # Filesystem cache of bookmarks + page content
├── /scripts
│   └── sync_bookmarks.py  # CLI to fetch + embed bookmark data
```

## Development

This is a monorepo project using pnpm workspaces. To get started:

1. Install python env and dependencies:
```bash
python3 -m venv .venv && source .venv/bin/activate && pip install -r packages/fetcher/requirements.txt ; packages/embedder/requirements.txt
```

2. Fetch bookmarks
```bash
python3 packages/fetcher/pinboard_fetcher.py
```

3. Run embedder
```bash
python3 packages/embedder/embedder.py
```

3. Run the development servers:
```bash
# Terminal 1: Frontend
cd apps/web
pnpm dev

# Terminal 2: Backend
cd apps/api
pnpm dev
```



## License

MIT 