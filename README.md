# Note App (Local-First)

A local-first note taking app built with React, Vite, TypeScript, and RxDB.
It stores notes and semantic embeddings entirely on-device, enabling offline note creation, editing, and semantic search without external servers.

## What it does

- Stores notes locally with RxDB and browser storage.
- Generates semantic embeddings in the browser using `@xenova/transformers`.
- Provides instant semantic search over note content.
- Supports add / edit / delete note workflows with autosave.
- Lets users export and import localStorage as JSON.
- Uses a service worker to cache the app shell and keep updates fresh.

## Architecture

- `src/App.tsx`: app shell and state orchestration.
- `src/components/notes`: note creation, search, and editing UI.
- `src/components/settings`: export/import localStorage and settings dialog.
- `src/contexts/menu-control-context.tsx`: shared menu/dialog state for Add Note and Settings.
- `src/lib/db.ts`: RxDB local database helpers.
- `src/lib/embedding.ts`: browser embedding generation and vector helpers.
- `src/hooks`: autosave and debounced semantic search logic.
- `public/sw.js`: service worker with smart caching for app shell assets and fresh requests.

## Offline behavior

- Notes and embeddings are generated and stored locally.
- Search and editing work offline after the first load.
- The service worker caches the app shell and refreshes static assets in the background.

## Run locally

1. Install dependencies:

   npm install

2. Start development server:

   npm run start

3. Build production bundle:

   npm run build

4. Preview production build:

   npm run preview
