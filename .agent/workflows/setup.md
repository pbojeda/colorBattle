---
description: How to setup the development environment from scratch
---

# Project Setup Guide

Follow these steps to get the ColorBattle project running locally.

## Prerequisite
- Node.js v22+
- Git

## 1. Clone the Repository
```bash
git clone <repo-url>
cd colorBattle
```

## 2. Install Dependencies
Run this in the root (if we add a root package.json later) or individually:

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

## 3. Configure Environment Variables
Create `.env` files from templates (or ask the user for keys).

### Frontend (`frontend/.env`)
```ini
VITE_API_URL=http://localhost:3000
VITE_SENTRY_DSN=<your-frontend-dsn>
```

### Backend (`backend/.env`)
```ini
PORT=3000
MONGO_URI=<your-mongodb-uri>
SENTRY_DSN=<your-backend-dsn>
```

## 4. Run Locally
You will need two terminal tabs.

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

## 5. Verification
- Frontend should be running at `http://localhost:5173`
- Backend should be running at `http://localhost:3000`
- Check health: `curl http://localhost:3000/health` -> "OK"
