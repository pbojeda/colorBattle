# ColorBattle Backend

The backend API for ColorBattle, built with Node.js, Express, and MongoDB.

## 🚀 Features
- **REST API**: Manages Battles, Votes, and Themes.
- **Real-time**: Socket.io for instant vote updates.
- **AI Integration**: Google Gemini for dynamic themes and meme text generation.
- **Image Generation**: `canvas` for meme composition.

## 🛠️ Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
    *Note: This project uses `canvas`. If installation fails, follow [setup instructions](https://github.com/Automattic/node-canvas#compiling) for your OS.*

2.  **Environment Variables**:
    Create a `.env` file:
    ```env
    PORT=3000
    MONGO_URI=mongodb+srv://... (or local)
    GEMINI_API_KEY=your_google_ai_key
    SENTRY_DSN=your_sentry_dsn
    ```

3.  **Run Locally**:
    ```bash
    npm start
    ```

4.  **Seed Data**:
    ```bash
    npm run seed
    ```
    Generates dummy battles for testing.

## 📂 Structure
- `src/controllers`: Request handlers.
- `src/services`: Business logic (AI, DB, Memes).
- `src/models`: Mongoose schemas.
- `src/assets`: Static assets (meme templates).
