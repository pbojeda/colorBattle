# Design Document - v4: Engagement & AI 🎨

## 1. Introduction
The goal of v4 is to increase user engagement and viral potential by making each battle visually unique and sharable. We will leverage AI to generate dynamic themes and memes based on the battle content.

## 2. Functional Use Cases

### UC-01: Dynamic Battle Themes
**As a** user creating a battle,
**I want** the battle page to have a color scheme and pattern that matches the topic (e.g., "Forest vs Ocean" -> Green vs Blue),
**So that** the experience feels premium and immersive.

- **Trigger**: User creates a battle.
- **Process**:
    1.  Backend receives `name` and `options`.
    2.  Backend calls Google Gemini (via `GoogleGenerativeAI`) to determine:
        -   Color for Option A (Hex)
        -   Color for Option B (Hex)
        -   Background Style (Gradient/Pattern CSS)
    3.  Backend saves these visual assets in the `Battle` schema.
    4.  Frontend renders the battle using these dynamic styles.


### UC-02: Fallback Mechanism
**As a** system,
**I want** to use default themes if AI services are down or slow,
**So that** core functionality (voting) is never blocked.


### UC-03: AI Meme Generation (Viral Share)
**As a** user viewing a battle,
**I want** to share a funny meme image representing the conflict,
**So that** I can challenge my friends on social media with rich content.

- **Trigger**: User clicks "Share" or battle creation completes.
- **Process**:
    1.  Backend generates a prompt for an Image Model (e.g., Imagen 3 via Vertex AI or Gemini Multimodal).
    2.  Model generates an image (e.g., "A cinematic shot of a cat facing off against a dog").
    3.  Backend stores the image URL.
    4.  Frontend uses this image for `og:image` tags.


## 3. Non-Functional Requirements

-   **Latency**: Battle creation should not exceed 3 seconds. If AI generation takes longer, it should happen asynchronously (background job).
-   **Cost Efficiency**: Cache AI results. Do not re-generate themes for identical battle names.
-   **Reliability**: AI failure must not fail the battle creation.

## 4. Engineering Standards (v4 Compliance)

### Code Quality
-   **Linting**: All new code must pass `eslint` with no errors.
-   **Typing**: (Optional but recommended) Use JSDoc or PropTypes since we are in JS.

### Architecture
-   **Service Layer**: All AI logic must be encapsulated in `AIService.js`, not in controllers.
-   **Async Processing**: Use a queue or fire-and-forget pattern for image generation if it takes >2s.

### Testing
-   **Unit Tests**: Mock AI responses to test the integration logic without spending credits.
