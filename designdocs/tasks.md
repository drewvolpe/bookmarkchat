✅ MVP Build Plan (Granular Steps)
📦 1. Project Setup
1.1 Initialize Monorepo
Create root project folder: bookmark-chat-app

Create subfolders: /apps/web, /apps/api, /packages/fetcher, /packages/embedder, /data/cache, /scripts

Initialize Git + root README.md

✅ Done when: Folders exist and git status is clean.

🧪 2. Pinboard Bookmark Sync
2.1 Create .env file with Pinboard token
Store token as PINBOARD_TOKEN=your_token_here

✅ Done when: .env exists and is ignored via .gitignore

2.2 Write pinboard_fetcher.py to fetch bookmarks
Load token from .env

Call Pinboard /posts/all

Save bookmarks to data/cache/bookmarks.json

✅ Done when: JSON file is written with valid bookmarks

2.3 Add caching check to pinboard_fetcher.py
Skip fetching if cache file exists and --force not passed

✅ Done when: Re-running script without --force skips network call

🌐 3. Webpage Content Fetching
3.1 Write page_fetcher.py to fetch + extract readable text
Input: URL

Output: Clean page text (use newspaper3k or readability-lxml)

Save to data/cache/pages/<url_hash>.txt

✅ Done when: Text file written for at least 1 URL

3.2 Write loop to fetch all bookmarks' pages
Read from bookmarks.json

Download + save content for each (respect cache)

✅ Done when: Local folder has .txt files for multiple URLs

🧠 4. Embedding + Vector Search
4.1 Add chunker.py to split page text into chunks
Input: text string

Output: list of chunks (~500 tokens)

✅ Done when: Unit test shows 2+ chunks per ~1000-word input

4.2 Add embedder.py to call OpenAI embeddings API
Input: list of text chunks

Output: list of vectors

✅ Done when: Embeddings returned and printed (use mock mode if no key)

4.3 Add vectorstore.py with basic FAISS support
Store: (vector, metadata)

Query: input vector → top-K results

✅ Done when: Search returns relevant chunks from stored data

4.4 Write sync_bookmarks.py
Combine:

Fetch bookmarks

Fetch pages

Chunk + embed

Store in FAISS

✅ Done when: Running script populates FAISS index

🧠 5. Backend API
5.1 Set up apps/api with FastAPI
Create main.py and simple root endpoint

✅ Done when: curl localhost:8000/ returns {"message":"ok"}

5.2 Add /chat endpoint
Accepts: POST { query: string }

Embeds query → vector search → return top K results

✅ Done when: Response includes relevant chunk metadata (not LLM yet)

5.3 Add LLM call to /chat
Use OpenAI or mock

Return synthesized response based on top chunks

✅ Done when: Query returns paragraph answer with sources

💻 6. Frontend (Next.js)
6.1 Initialize Next.js app in apps/web
Create page: pages/index.tsx

Render input box + message list

✅ Done when: Typing input updates component state

6.2 Connect frontend to /chat endpoint
On submit, send query → render response

✅ Done when: Typing question shows chat response

6.3 Show bookmark metadata with response
Title + URL alongside LLM response

✅ Done when: Chat shows source links

🧹 7. Final MVP Polish
7.1 Add loading states + error handling to UI
✅ Done when: UX doesn’t break on slow/missing responses

7.2 Add simple search/filter UI for bookmarks
✅ Done when: Can search list of bookmarks by keyword/tag

7.3 Write README with setup/run instructions
✅ Done when: Clone → run works end to end