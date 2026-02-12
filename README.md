# ColorBattle (MVP v2)

Welcome to **ColorBattle**, a real-time viral voting platform where users choose sides in epic binary battles (e.g., "Red vs Blue").

![Status](https://img.shields.io/badge/Status-Live-success)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![Database](https://img.shields.io/badge/Datebase-MongoDB-forest)

## 🚀 Features (MVP v2)
- **Real-time Voting**: WebSockets (Socket.io) update vote counts instantly for all users.
- **Juicy UX**: Confetti explosions, sound effects, and spring physics animations.
- **Viral Mechanics**: Web Share API integration to challenge friends.
- **Anti-Cheat**: Device fingerprinting to limit votes.
- **Observability**: Sentry error tracking + UptimeRobot monitoring.
- **DevOps**: Automated CI/CD pipelines via GitHub Actions (Vercel & Render).

## 🛠️ Tech Stack
- **Frontend**: React, TailwindCSS, Framer Motion, Socket.io-client.
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
4.  **Run**:
    *   Backend: `npm start`
    *   Frontend: `npm run dev`

## 🔮 Roadmap (v3)
- **Multiple Battles**: Support for creating and listing user-generated battles.
- **Dynamic Routing**: `/battle/:id` pages.
- **Leaderboards**: See trending battles.

---
*Maintained by the Agentic Team*