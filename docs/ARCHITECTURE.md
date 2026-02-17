# ColorBattle Technical Architecture 🏛️

This document describes the high-level architecture of ColorBattle (MVP v6).

## 🌍 Overview
ColorBattle is a real-time binary voting platform with AI-driven content generation and social features. It uses a decoupled architecture with a Node.js/Express backend and a React/Vite frontend.

## 🧱 Component Breakdown

### 🟢 Backend (Node.js + Express)
- **Framework**: Express.js with Socket.io for real-time events.
- **Database**: MongoDB (Mongoose ODM).
- **Core Services**:
    - **AIService**: Manages AI interactions with a **Multi-LLM Fallback Strategy**:
        1. **Gemini 1.5 Flash**: Primary provider (Fast/Free).
        2. **OpenAI GPT-3.5**: Secondary provider (Robust/Paid) triggers on Gemini failure (429/500).
        3. **Static Fallback**: Final safety net using random templates/colors if both AIs fail.
    - **MemeService**: Uses `canvas` to generate images on-the-fly. Merges AI-generated text with pre-defined templates.
    - **BattleService**: Orchestrates battle creation, voter state, and AI integration.
- **Social Engine**:
    - Real-time chat with room-based isolation (`battleId`).
    - Fingerprint-based identity (no auth).
    - Funny nickname generator (voter vs listener roles).

### 🔵 Frontend (React + Vite)
- **State Management**: React Hooks (`useState`, `useEffect`) and local state.
- **Animations**: `framer-motion` for physics-based voting bars and floating emoji "rain".
- **Styling**: TailwindCSS.
- **API Communication**: `axios` for REST, `socket.io-client` for real-time sync.

## 🔄 Data Flows

### 🗳️ Voting Flow
1. User clicks an option in `BattleArena.jsx`.
2. Frontend sends `POST /api/battle/:id/vote` along with `deviceId` (FingerprintJS).
3. Backend updates DB and emits `vote_update` via Socket.io to the room.
4. All connected clients receive the event and animate their UI bars using spring physics.

### 🎭 Chat & Reactions
1. User sends message/reaction.
2. Backend broadcasts the event to the room after validation.
3. Frontend triggers local animations (floating emojis or chat list updates).

### 🎬 Meme Generation
1. User clicks 😂.
2. Backend triggers Gemini to get a "funny context" based on battle results.
3. `MemeService` picks a template and draws text over it.
4. Returns a Blob/URL for download and sharing.

## 🗄️ Models
- **Battle**: Stores options, votes, and AI-generated theme.
- **Comment**: Stores chat history, linked to `battleId` and `fingerprint`.

## 🛠️ Infrastructure
- **Sentry**: Integrated in both backend and frontend for error tracking.
- **Docker**: Simple `Dockerfile` provided for backend deployment.
