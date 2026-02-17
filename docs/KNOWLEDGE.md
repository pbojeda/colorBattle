# Project Context Snapshot (V6) 🧠

Use this file to quickly bring an AI agent or a new developer up to speed on the current project state and technical debt.

## 🚀 Status: Phase 6 Completed (Robust Testing)
The project is currently feature-complete for the MVP scope, with a high-coverage test suite (19 passing tests).

## 🛠️ Critical Tech Stack
- **Backend**: Node/Express, Mongoose, Socket.IO, `@google/generative-ai`, `canvas`.
- **Frontend**: React (Vite), Framer Motion (physics-aware), FingerprintJS.
- **Infrastructure**: Sentry, Docker (basic).

## 🔐 Identity System
- **Auth-less**: Everything revolves around the `fingerprint` (device ID).
- **Nicknames**: Generated on-the-fly. Logic in `SocialController.js`.
- **Nickname Collision**: Unique per battle. A user can keep their name, but others can't take it.

## 🤖 AI Logic
- **AIService**: Single point of failure for themes/memes. Robust retry logic implemented. Use `generateBattleTheme` for colors and `generateMemeContext` for text.
    - [See Pattern: AI Resilience & Multi-LLM Backup](./knowledge/ai_resilience_pattern.md)
- **Meme Generation**: Returns a Blob via `axios` responseType. Blob URLs are handled in `BattlePage.jsx`.

## ⚠️ Known Gotchas & Tech Debt
- **Sentry Warning**: A warning about missing Express instrumentation appears in tests (due to import order). It doesn't affect functionality but should be streamlined.
- **Canvas Latency**: Meme generation can take 5-10s due to AI. E2E tests use 60s timeouts or mocks.
- **MongoDB Connections**: `server.js` was refactored to export `app` and `server` for testing. Ensure `NODE_ENV=test` is set to avoid DB collisions during Jest runs.

## 📈 Next Steps (v7 Plan)
1.  **User Profiles**: Optional Google Login to persist battle history.
2.  **Moderation**: AI-based chat filtering using Gemini.
3.  **Polling**: Fallback mechanism for Sockets in unstable networks.
