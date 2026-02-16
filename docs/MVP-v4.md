# ColorBattle MVP-v4: Engagement & AI 🎨

This release introduces AI-driven features to increase user engagement and virality.

## 🌟 New Features

### 1. Dynamic Themes (AI-Powered)
- **What it is**: The application now adapts its color scheme and background based on the battle name.
- **How it works**:
    - When a battle is created or loaded, the backend checks if a theme exists.
    - If not, it calls Google Gemini AI to analyze the battle name (e.g., "Forest vs Ocean") and generate a JSON theme (Green/Blue colors, gradient background).
    - **Fallback**: If AI fails or API key is missing, it gracefully degrades to the classic Red/Blue theme.
- **Visuals**: Battle cards and the Battle Arena now reflect these unique themes.

### 2. AI Meme Generation (Remix Strategy)
- **What it is**: Users can generate a funny meme related to the current battle with a single click.
- **How it works**:
    - **Trigger**: A "😂" button in the Battle Arena.
    - **AI Context**: Gemini AI generates a witty caption in Spanish based on the battle context (e.g., for "Summer vs Winter", it might choose the "Drake" template preferring Summer).
    - **Image Generation**: The backend uses `canvas` to overlay the AI-generated text onto classic meme templates (Drake, Distracted Boyfriend, Two Buttons).
    - **Delivery**: The image is served directly to the frontend via a specific endpoint.
- **Sharing**: Users can download the meme or share it via the Web Share API (mobile).

### 3. UI/UX Improvements
- **Sorting**: The "Recent Battles" list is now sorted by total votes (descending) to highlight active battles.
- **Filtering**: Trending battles (Top 5) are excluded from the main list to avoid duplication.
- **Smart Rounding**: Vote percentages are rounded intelligently to avoid "50% vs 50%" displays when vote counts are not equal (e.g., displayed as 51% vs 49%).
- **Localization**: The entire application (UI and AI prompts) has been localized to **Spanish**.

## 🛠️ Technical Details

### Backend
- **New Dependency**: `canvas` (for server-side image manipulation).
- **New Service**: `MemeService.js` (handles template loading and text drawing).
- **Updated Service**: `AIService.js` (includes `generateMemeContext` method).
- **Assets**: Added `src/assets/memes/` with templates and `templates.json` metadata.

### Frontend
- **New Component**: `MemeButton.jsx`.
- **New Modal**: Integrated into `BattlePage.jsx` for displaying the generated meme.
- **Localization**: Hardcoded strings replaced with Spanish text.

## 🚀 Setup for v4

### Backend
1.  **Install Dependencies**:
    ```bash
    cd backend
    npm install
    ```
    *Note: `canvas` may require system dependencies (Cairo/Pango) on some OSs. On macOS, `brew install pkg-config cairo pango libpng jpeg giflib librsvg` might be needed if binary installation fails.*
2.  **Environment Variables**:
    - Ensure `GEMINI_API_KEY` is set in `.env`.

### Frontend
1.  **Install Dependencies**:
    ```bash
    cd frontend
    npm install
    ```
2.  **Run**: `npm run dev`

## 🔮 What's Next (v5)
- **Social Interactions**: Real-time chat and reactions.
- **User Accounts**: Track voting history and created battles.
