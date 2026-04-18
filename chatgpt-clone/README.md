# Google Gemini Clone

A full-stack Google Gemini clone supporting Markdown, code syntax highlighting, and real-time Server-Sent Events (SSE) streaming responses from the Google Gemini API.

## Features
- **Real-time Streaming:** Text appears inline just like Google Gemini via `TextDecoder` and SSE.
- **Rich Text:** Renders Github Flavored Markdown (GFM), tables, nested lists.
- **Syntax Highlighting:** Themeable code blocks using Prism.
- **Conversations:** Start new chats, auto-names them, delete history.
- **Mobile Responsive:** Sidebar collapses on mobile natively.
- **Dark Mode:** Crafted with pure Tailwind CSS.

## Getting Started

### 1. Setup Backend
```bash
cd server
npm install
cp .env.example .env
```
Open `server/.env` and paste your actual `GEMINI_API_KEY`.
Start the backend API:
```bash
npm start
```
The server will run on `http://localhost:3001`.

### 2. Setup Frontend
Ensure your backend is running, then open a new terminal:
```bash
cd client
npm install
npm run dev
```
The client will start pointing to `http://localhost:5173`. Any fetch calls to `/api/*` are natively proxied to the backend by Vite.

## Architecture Notes
- The `useChat.js` custom React hook manages conversation state completely in frontend memory. If you want database persistence, replace `useState()` inside that hook with fetch calls to your Express database endpoints.
