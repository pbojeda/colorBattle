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

    async generateMemeContext(battleName, options = []) {
        const genAI = this.getGenAI();
        if (!genAI) return null;

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
            // Templates defined in backend (hardcoded reference for prompt)
            const templates = ["drake", "distracted", "two_buttons"];
            const optionsText = options.length > 0 ? `Options: ${options.map(o => o.name).join(", ")}` : "";

            const prompt = `Genera un contexto gracioso para un meme sobre una batalla llamada "${battleName}" ${optionsText}. 
            Elige UNA plantilla de: ${templates.join(", ")}.
            
            - para 'drake': text0 es lo que rechaza (la peor opción), text1 es lo que le gusta (la mejor opción).
            - para 'distracted': text0 es el 'novio distraído' (usuario/votante), text1 es la 'chica distraída' (la opción tentadora), text2 es la 'novia' (la opción aburrida).
            - para 'two_buttons': text0 es botón 1, text1 es botón 2 (decisión difícil).

            El texto debe ser en ESPAÑOL, corto y gracioso.
            Return ONLY JSON: { "templateId": "string", "texts": ["string", "string", ...] }`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonStr = text.replace(/```json|```/g, "").trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("AIService Meme Error:", error.message);
            return null;
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
