# Bookmark Chat

A web application that allows you to chat with your bookmarks. Downloads them from Pinboard, fetches each page, builds embeddings, and allows you to chat with them.

## Features

- Chat interface for interacting with your bookmarks
- Bookmark management with tags and search
- Settings for customizing the AI model and parameters
- Dark mode support
- Responsive design

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Creating data from your Pinboard account

### Prerequisites

1. **Python Environment**: Make sure you have Python 3.9+ installed
2. **API Keys**: You'll need:
   - Pinboard API token (from https://pinboard.in/settings/password)
   - OpenAI API key (from https://platform.openai.com/api-keys)

### Step 1: Environment Setup

1. Create a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r packages/fetcher/requirements.txt
   pip install -r packages/embedder/requirements.txt
   ```

3. Set up your environment variables. Create a `.env` file in the project root:
   ```bash
   # Pinboard API token (get from https://pinboard.in/settings/password)
   PINBOARD_TOKEN=your_username:your_api_token
   
   # OpenAI API key (get from https://platform.openai.com/api-keys)
   OPENAI_API_KEY=sk-your-openai-api-key
   ```

### Step 2: Download Bookmarks from Pinboard

Run the pinboard fetcher to download all your bookmarks:

```bash
python3 packages/fetcher/pinboard_fetcher.py
```

This will:
- Fetch all your bookmarks from Pinboard
- Save them to `bookmarks.json` in the project root
- Show progress and any errors

**Options:**
- `--force`: Force a fresh download (ignores cache)

### Step 3: Download Page Content

Run the page fetcher to download the content of each bookmarked page:

```bash
python3 packages/fetcher/page_fetcher.py
```

This will:
- Read the bookmarks from `bookmarks.json`
- Download and parse the content of each webpage
- Save the content to `data/cache/pages/` with filename based on URL hash
- Show progress and skip already downloaded pages

**Options:**
- `--force`: Force re-download of all pages (ignores cache)
- `--limit N`: Only process the first N bookmarks (useful for testing)

### Step 4: Create Embeddings

Run the embedder to create embeddings for all the downloaded content:

```bash
python3 packages/embedder/embedder.py
```

This will:
- Read the cached page content
- Split text into chunks using the sophisticated TextChunker (500 tokens per chunk)
- Create embeddings for each chunk using OpenAI's text-embedding-3-small model
- Save embeddings to `data/embeddings/` with filename based on URL hash
- Track progress to avoid re-processing already embedded pages

**Options:**
- `--clean`: Clear progress tracking and start fresh


### Common Issues:

1. **API Key Errors**: Make sure your `.env` file is in the project root and contains valid API keys

2. **Rate Limiting**: If you hit rate limits:
   - The scripts include delays between requests
   - You can increase delays in the code if needed
   - Consider using `--limit` to process fewer bookmarks at once

3. **Memory Issues**: For large bookmark collections:
   - Process in smaller batches using `--limit`
   - Ensure you have sufficient disk space for cached content

4. **Network Issues**: If downloads fail:
   - Check your internet connection
   - Some sites may block automated requests
   - Use `--force` to retry failed downloads

#### File Locations:

- Bookmarks: `bookmarks.json` (project root)
- Cached pages: `data/cache/pages/`
- Embeddings: `data/embeddings/`
- Progress tracking: `data/cache/embedder_progress.json`

#### Monitoring Progress:

- Each script shows progress as it runs
- Check the console output for any errors
- Use `--clean` flag to restart from scratch if needed

The scripts are designed to be resumable - you can stop and restart them, and they'll continue from where they left off.


## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand
- Heroicons

## Project Structure

```
src/
  ├── app/              # Next.js app directory
  ├── components/       # React components
  │   ├── chat/        # Chat-related components
  │   ├── bookmarks/   # Bookmark-related components
  │   ├── settings/    # Settings-related components
  │   └── layout/      # Layout components
  ├── store/           # Zustand store
  ├── types/           # TypeScript types
  └── utils/           # Utility functions
```

## License

MIT 
