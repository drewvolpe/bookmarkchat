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
