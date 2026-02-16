# Product Context: Viral Battles

## Project Overview
**Viral Battles** is a web application designed to host humorous and engaging "battles" between two opposing options (e.g., Red vs. Blue, Omelette w/ Onion vs. Omelette w/o Onion). The core mechanics rely on visual simplicity and humor to drive user engagement and social sharing.

## Core Value Proposition
- **Entertainment**: Users enjoy the visual spectacle of their choice "fighting" the other.
- **Expression**: A simple way to publicly state a preference on trivial but debated topics.
- **Virality**: Built-in mechanisms to encourage sharing ("Help my team win!").

## MVP Features (The "First Battle")
1.  **Single Battle**: The MVP will host one active battle (e.g., "Red vs Blue").
2.  **Voting**:
    -   Users can vote once per device/IP.
    -   Visual feedback immediately upon voting (animations, sound effects).
3.  **Real-time(ish) Updates**: The "battle" state (who is winning) is visible.
4.  **Sharing**:
    -   One-click share to WhatsApp/Twitter/Telegram.
    -   Dynamic messages: "Red is losing! Help us defeat Blue!"
5.  **Re-voting**: Allow changing the vote within a 24h window (correction mechanism).
6.  **Device Identification**:
    -   **Primary**: Browser Fingerprinting (using open-source `FingerprintJS` library). This generates a unique ID based on browser attributes (User Agent, Screen, Fonts, etc.) which persists across Incognito/Cookie clears.
    -   **Backend**: Enforces one vote per Fingerprint ID per 24h.
    -   *Note*: While not 100% infallible (perfect tracking requires login), it significantly reduces casual manipulation compared to simple Cookies/LocalStorage.

## User Flow
1.  User lands on the page.
2.  Sees two animated characters/shapes representing the options, currently "fighting" (one might be bigger or pushing the other based on votes).
3.  User clicks their preference.
4.  Animation intensifies for their choice.
5.  Stats are revealed ( percentages, total votes).
6.  Prompt to share: "Your side needs you! Share to get more reinforcements."

## Technical Architecture (Current)
-   **Backend**: Node.js + Express + Socket.io.
-   **Data Storage**: MongoDB (Atlas) for persistence of battles, votes, comments, and reactions.
-   **AI**: Google Gemini integration for dynamic themes and meme captioning.
-   **Frontend**: React + Vite + Framer Motion.
-   **Device Identification**: FingerprintJS (visitorId) for voting and chat identity.

## Current Phase: MVP v5 (Social & Real-time)
- **Multiple Battles**: Fully operational.
- **AI Themes**: Operational.
- **AI Memes**: Operational.
- **Real-time Engine**: Socket.io handles voting updates, chat, and reactions.
- **Social**: Live chat and floating reactions are active.

## Future Roadmap (Next)
- **User Accounts**: Persistent profiles and history.
- **Advanced Moderation**: AI-based content filtering.
- **Leaderboards**: Global ranking of most popular battles and active users.
- **Competitive Seasons**: Limited-time arenas with special rewards.
