# ColorBattle - MVP v3 Documentation

## 1. Business & Product Goals
**Objective**: Transform the single "Red vs Blue" demo into a scalable platform where users can create and share their own binary battles.
**Key Metrics**:
-   User retention (returning to check vote counts).
-   Viral growth (sharing specific battle links).
-   Engagement (number of votes per user).

## 2. Aborded Functionalities (v3)

### A. Multiple Battles Architecture
-   **Dynamic Routing**: moved from a single page to a multi-page app (`/` for list, `/battle/:id` for specific battles).
-   **Battle Creation**: Users can generate new battles with custom names and options (e.g., "Cats vs Dogs").
-   **Listing**:
    -   **Trending**: Top 5 most voted battles.
    -   **Recent**: Paginated list of all created battles (infinite scroll style via "Load More").

### B. Technical Enhancements
-   **Server-Side Pagination**: Optimized `GET /api/battles` to handle large datasets efficiently using `skip/limit`.
-   **Socket.io Rooms**: Refactored real-time logic to use `socket.join(battleId)`, ensuring users only receive updates for the battle they are viewing.
-   **Data Seeding**: Automated script to populate the database with diverse content for testing.

### C. UI/UX Improvements
-   **Mobile-First Design**: Optimized layout for smaller screens, ensuring forms and lists are accessible.
-   **Rich Interactions**: Maintained the "juicy" feel with animations, confetti, and sounds.
-   **Observability**: Integrated Sentry for frontend and backend error tracking.

## 3. Technology Stack

### Frontend
-   **Framework**: React 19 + Vite
-   **Styling**: TailwindCSS v4
-   **State/Router**: React Router DOM v7
-   **Real-time**: Socket.io-client
-   **Animation**: Framer Motion

### Backend
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (Mongoose ODM)
-   **Real-time**: Socket.io

### Infrastructure
-   **Frontend Hosting**: Vercel
-   **Backend Hosting**: Render
-   **CI/CD**: GitHub Actions (planned/partial)

## 4. Key Decisions & Trade-offs
-   **No Auth (Yet)**: To lower the barrier to entry, we allow anonymous battle creation and voting. We use device fingerprinting (`@fingerprintjs/fingerprintjs`) to prevent simple spamming.
-   **Separate Trending Endpoint**: Created `/api/battles/trending` to decouple the expensive aggregation logic from the standard listing query.
-   **CSS Scroll Fixes**: moved away from `overflow: hidden` on body to allow natural scrolling on mobile, critical for the list view.

## 5. Deployment & Troubleshooting
-   **Private Registry Error**: Encountered `E401` on Vercel due to a local `.npmrc`/lockfile issue. **Fix**: Regenerated `package-lock.json` using the public npm registry to ensure clean deployments.

## 6. Future Roadmap (v4)
-   **User Accounts**: "My Battles" and "My Votes" history.
-   **Admin Tools**: Ability to ban/delete inappropriate content.
-   **Social Features**: Comments per battle.
