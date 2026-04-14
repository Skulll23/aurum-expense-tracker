// ============================================================
// client/vite.config.js — VITE BUILD TOOL CONFIGURATION
//
// Vite is the tool that:
//   1. Runs the React development server on port 5173
//   2. Transforms JSX files into plain JavaScript the browser understands
//   3. Provides Hot Module Replacement (HMR) — updates the browser
//      instantly when you save a file, without a full page reload
//
// THE PROXY — most important part for this project:
//   The browser runs on port 5173, the API runs on port 5001.
//   Browsers block cross-port requests (CORS security).
//   The proxy makes any request to /api/* get secretly
//   forwarded to http://localhost:5001 — the browser thinks
//   it's talking to itself, so no CORS error.
//
//   Example:
//   fetch('/api/expenses')
//   → Vite intercepts it
//   → forwards to http://localhost:5001/api/expenses
//   → returns the response to React as if it came from port 5173
// ============================================================

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // plugins: tell Vite to support React (JSX syntax, HMR for components)
  plugins: [react()],

  server: {
    port: 5173, // the port the React app runs on in development

    proxy: {
      // Any request starting with /api gets forwarded to port 5001
      '/api': {
        target: 'http://localhost:5001', // the Express backend
        changeOrigin: true,              // rewrites the Host header to match the target
        secure: false,                   // allows HTTP (not just HTTPS)
      },
    },
  },
});
