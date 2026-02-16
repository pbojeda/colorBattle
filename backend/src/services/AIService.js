const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

class AIService {
    constructor() {
        this.genAI = null;
    }

    getGenAI() {
        if (!this.genAI && process.env.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        }
        return this.genAI;
    }

    async generateBattleTheme(battleName, options = [], attempt = 1) {
        const genAI = this.getGenAI();

        if (!genAI) {
            console.log("AIService: No API Key, using fallback.");
            return this.getDefaultTheme();
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
            const optionsText = options.length > 0 ? `Options: ${options.map(o => o.name).join(", ")}` : "";
            const prompt = `Generate a color theme for a battle named "${battleName}" ${optionsText}. Return ONLY a JSON object with this structure: { "optionAColor": "#hex", "optionBColor": "#hex", "background": "valid css background value for a linear gradient" }. Ensure high contrast and vibrant colors suitable for a dark mode UI.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up markdown code blocks if present
            const jsonStr = text.replace(/```json|```/g, "").trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error(`AIService Error (Attempt ${attempt}):`, error.message);
            if (attempt < 2) {
                console.log("Retrying in 1 second...");
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.generateBattleTheme(battleName, options, attempt + 1);
            }
            return this.getDefaultTheme();
        }
    }

    getDefaultTheme() {
        return {
            optionAColor: "#ef4444", // Red-500
            optionBColor: "#3b82f6", // Blue-500
            background: "linear-gradient(to right, #1f2937, #111827)" // Matches Schema default 
            // Actually, the prompt asks for "valid css background value".
            // Let's stick to a safe default that matches current UI.
            // Current UI is dark.
        };
    }
}

module.exports = new AIService();
