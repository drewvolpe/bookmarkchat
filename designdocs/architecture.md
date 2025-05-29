
🗂 Architecture: Chat with Your Bookmarks from Pinboard.in

📦 File & Folder Structure
bash
Copy
Edit
/bookmark-chat-app
├── /apps
│   ├── /web            # Next.js frontend (chat UI)
│   └── /api            # FastAPI or Express backend service
├── /packages
│   ├── /fetcher        # Shared logic to fetch/cache Pinboard + webpage content
│   └── /embedder       # Embedding & vector store logic (e.g., OpenAI, FAISS)
├── /data
│   └── /cache          # Filesystem cache of bookmarks + page content
├── /scripts
│   └── sync_bookmarks.py  # CLI to fetch + embed bookmark data
├── docker-compose.yml
├── README.md
🧩 What Each Part Does
apps/web (Next.js frontend)
Chat UI with bookmarks

TypeScript + Tailwind for styling

Calls backend API for chat and search

Handles user auth (optional: via Pinboard token)

Key files:

pages/index.tsx: main chat page

components/ChatBox.tsx: chat input/output UI

hooks/useBookmarks.ts: fetch list of bookmark titles/tags

lib/api.ts: wraps backend API calls

apps/api (FastAPI or Express backend)
Serves chat API

Interfaces with vector DB (e.g., FAISS or Qdrant)

Provides:

/chat — respond to chat query

/bookmarks — list/search bookmarks

/sync — manual or scheduled sync

Key files (FastAPI):

main.py: entrypoint

routes/chat.py: chat endpoints

routes/sync.py: sync + fetch logic

services/embedder.py: text embedding logic

services/vectorstore.py: search logic

packages/fetcher
Downloads bookmarks from Pinboard API

Fetches content of bookmarked pages

Caches both to filesystem (/data/cache)

Key files:

pinboard_fetcher.py: API fetch + local diff

page_fetcher.py: HTML retrieval & readability extraction

cache.py: caching layer (by bookmark URL hash)

packages/embedder
Embeds webpage content using OpenAI or local models

Stores embeddings in vector DB (e.g., FAISS or Qdrant)

Supports chunking & metadata tagging (url, tags)

Key files:

embedder.py: wraps OpenAI API or sentence-transformers

vectorstore.py: handles insert/query of vectors

chunker.py: splits HTML/page text for embedding

/scripts/sync_bookmarks.py
CLI or cron-run script

Steps:

Download all bookmarks

Fetch page contents (cache-aware)

Embed & store in vector DB

🧠 State Management & Data Flow
🔁 Sync Pipeline
sync_bookmarks.py triggered manually or by cron

pinboard_fetcher.py pulls all bookmarks

page_fetcher.py downloads & extracts readable HTML

embedder.py chunks and embeds content

vectorstore.py stores (url, title, tag, embed chunks)

All results are cached in:

/data/cache/bookmarks.json

/data/cache/pages/<url_hash>.html

💬 Chat Flow
User inputs query in apps/web

Frontend sends to /chat endpoint

Backend embeds query → vector search on embedded pages

Returns relevant passages + LLM-generated response

Frontend displays result in conversation format

📚 State Lives In
State	Location	Format
Bookmarks list	/data/cache/bookmarks.json	JSON
Page contents	/data/cache/pages/	HTML or Markdown
Embeddings	Vector DB (FAISS, Qdrant, etc.)	Vectors + metadata
Chat state (frontend)	React state	In-memory
Auth tokens (optional)	localStorage / cookies	Token string

🔌 Integration Points
Component	Connects To	Purpose
Next.js frontend	Backend API (/chat)	Send user queries
API backend	Vector DB	Semantic search
API backend	Fetcher/embedder packages	Sync and enrich content
Sync script	Pinboard API	Download bookmarks
Sync script	OpenAI API (or local model)	Generate embeddings

🛠 Recommended Tech Stack
Part	Tech
Frontend	Next.js (TS), Tailwind
Backend	FastAPI (Python) or Express (TS)
Embedding	OpenAI (text-embedding-3-small)
Vector DB	FAISS (local), Qdrant (external opt)
Caching	Filesystem via hashlib for URLs
Scheduler	Cron or APScheduler

