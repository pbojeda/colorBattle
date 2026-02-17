# ColorBattle Testing Strategy 🧪

This document outlines the testing framework and procedures for ColorBattle.

## 🏗️ Frameworks
- **Backend**: Jest + Supertest (Integration).
- **Frontend Components**: Vitest + React Testing Library.
- **E2E**: Cypress.

## 🧪 Test Suites

### 🟢 Backend
- **Unit Tests**:
    - `aiservice.test.js`: Mocked Gemini API. Tests retry logic, JSON cleaning, and default fallbacks.
    - `memeservice.test.js`: Mocked `canvas` context. Tests template lookup and buffer generation.
- **Integration Tests**:
    - `battle_api.test.js`: POST/GET/VOTE flow. Ensures required fields and AI theme consistency.
    - `social_api.test.js`: Chat validation, nickname collision, and 200-char limits.

### 🔵 Frontend
- **Component Tests**:
    - `HomePage.test.jsx`: Form validation, loading states, and battle list rendering.
    - `BattleArena.test.jsx`: Theme application (colors) and voting interaction calls.

### 🎬 E2E (Cypress)
- `critical_path.cy.js`: Full creation → vote → chat flow.
- `multi_user.cy.js`: Simulates external user votes via API and verifies WebSocket updates in UI.
- `error_handling_memes.cy.js`: Verifies 404 pages and successfully mocks AI meme generation for stable UI verification.

## ⚙️ Running Tests

### All Backend Tests
```bash
cd backend
npm test
```

### All Frontend Unit/Component Tests
```bash
cd frontend
npm test
```

### All E2E Tests (Requires servers running)
```bash
# Terminal 1: backend (npm start)
# Terminal 2: frontend (npm run dev)
cd frontend
npx cypress run
```

## 🧠 Mocking Strategy
- **AI**: Gemini is always mocked in automated tests to avoid token usage and latency.
- **Canvas**: Native C++ dependencies are mocked in unit tests for CI compatibility.
- **WebSockets**: Verified via E2E by observing real UI changes triggered by API calls.
