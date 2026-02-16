# ColorBattle (MVP v3)

Welcome to **ColorBattle**, a real-time viral voting platform where users create and join epic binary battles (e.g., "Pizza con Piña vs Pizza sin Piña").

![Status](https://img.shields.io/badge/Status-Live-success)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![Database](https://img.shields.io/badge/Datebase-MongoDB-forest)

## 🚀 Features (MVP v3)
- **Multiple Battles**: Users can create their own battles with custom names and options.
- **Real-time Voting**: WebSockets (Socket.io) update vote counts instantly for all users in a specific battle room.
- **Trending & Recent**: Home page features a "Trending" section and a paginated list of recent battles.
- **Juicy UX**: Confetti explosions, sound effects, and spring physics animations.
- **Viral Mechanics**: Web Share API integration to challenge friends.
- **Anti-Cheat**: Device fingerprinting to limit votes.
- **Observability**: Sentry error tracking + UptimeRobot monitoring.

## 🛠️ Tech Stack
- **Frontend**: React, React Router, TailwindCSS, Framer Motion, Socket.io-client.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io.
- **Infrastructure**: Vercel (Frontend), Render (Backend).

## 📦 Getting Started
See the [Setup Guide](.agent/workflows/setup.md) for detailed instructions on running the project locally.

### Quick Start
1.  **Clone**: `git clone <repo>`
2.  **Install**: `npm install` in both `frontend/` and `backend/`.
3.  **Env Vars**: Copy `.env.example` (if available) or ask the team for keys.
    *   *Frontend needs*: `VITE_API_URL`, `VITE_SENTRY_DSN`.
    *   *Backend needs*: `MONGO_URI`, `SENTRY_DSN`.
4.  **Seed Data** (Optional):
    *   `cd backend && npm run seed` (Generates 30+ battles)
5.  **Run**:
    *   Backend: `npm start`
    *   Frontend: `npm run dev`

## 🔮 Roadmap

### v4: Engagement & AI 🎨
-   **Dynamic Themes**: Use AI to analyze battle topics and generate custom color schemes/patterns (not just Red vs Blue).
-   **AI Memes**: Integration with AI image generators to create shareable memes for the battle.
-   **Backend Updates**: Schema changes to store theme/asset data.

### v5: Social Interactions 💬
-   **Real-time Chat**: Comments section per battle powered by Socket.io.
-   **Reactions**: Emotes/reactions beyond simple voting.

### v6: Stability & Testing 🧪
-   **Backend**: Comprehensive Unit and Integration tests.
-   **Frontend**: E2E testing (Playwright/Cypress).

---
*Maintained by the Agentic Team*