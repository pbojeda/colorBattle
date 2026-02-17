# ColorBattle Frontend

The React frontend for ColorBattle, built with Vite and TailwindCSS.

## 🚀 Features
- **Interactive UI**: Real-time voting with physics-based animations (Framer Motion).
- **Responsive**: Mobile-first design.
- **Theming**: Dynamic colors based on battle themes.
- **AI Memes**: Generate and share memes directly from the UI.

## 🛠️ Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file (or set in deployment config):
    ```env
    VITE_API_URL=http://localhost:3000
    VITE_SENTRY_DSN=your_sentry_dsn
    ```

3.  **Run Locally**:
    ```bash
    npm run dev
    ```
    Server usually starts at `http://localhost:5173`.

4.  **Test**:
    - **Unit/Component**: `npm test` (Vitest)
    - **E2E**: `npx cypress run` (Requires both servers running)

## 📦 Build
```bash
npm run build
```
Outputs static files to `dist/`.
