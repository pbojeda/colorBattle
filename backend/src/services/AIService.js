const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");

class AIService {
    constructor() {
        this.genAI = null;
        this.openai = null;
    }

    getGenAI() {
        if (!this.genAI && process.env.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        }
        return this.genAI;
    }

    getOpenAI() {
        if (!this.openai && process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        }
        return this.openai;
    }

    async generateBattleTheme(battleName, options = []) {
        // Try Gemini First
        try {
            const theme = await this.generateThemeGemini(battleName, options);
            if (theme) return theme;
        } catch (error) {
            console.error("Gemini Theme Error:", error.message);
        }

        // Try OpenAI Second
        try {
            const theme = await this.generateThemeOpenAI(battleName, options);
            if (theme) return theme;
        } catch (error) {
            console.error("OpenAI Theme Error:", error.message);
        }

        // Fallback
        console.log("AIService: Using Default Theme Fallback.");
        return this.getDefaultTheme();
    }

    async generateMemeContext(battleName, options = []) {
        // Try Gemini First
        try {
            const context = await this.generateMemeGemini(battleName, options);
            if (context) return context;
        } catch (error) {
            console.error("Gemini Meme Error:", error.message);
        }

        // Try OpenAI Second
        try {
            const context = await this.generateMemeOpenAI(battleName, options);
            if (context) return context;
        } catch (error) {
            console.error("OpenAI Meme Error:", error.message);
        }

        // Fallback
        console.log("AIService: Using Default Meme Fallback.");
        return this.getFallbackMemeContext(battleName, options);
    }

    // --- GEMINI IMPLEMENTATIONS ---

    async generateThemeGemini(battleName, options) {
        const genAI = this.getGenAI();
        if (!genAI) throw new Error("No Gemini API Key");

        console.log("AIService: Generating Battle Theme (Gemini) for:", battleName);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const optionsText = options.length > 0 ? `Options: ${options.map(o => o.name).join(", ")}` : "";
        const prompt = `Generate a color theme for a battle named "${battleName}" ${optionsText}. Return ONLY a JSON object with this structure: { "optionAColor": "#hex", "optionBColor": "#hex", "background": "valid css background value for a linear gradient" }. Ensure high contrast and vibrant colors suitable for a dark mode UI.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return JSON.parse(text.replace(/```json|```/g, "").trim());
    }

    async generateMemeGemini(battleName, options) {
        const genAI = this.getGenAI();
        if (!genAI) throw new Error("No Gemini API Key");

        console.log("AIService: Generating Meme Context (Gemini) for:", battleName);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const templates = ["drake", "distracted", "two_buttons"];
        const optionsText = options.length > 0 ? `Options: ${options.map(o => o.name).join(", ")}` : "";

        const prompt = `Genera un contexto gracioso para un meme sobre una batalla llamada "${battleName}" ${optionsText}. 
            Elige UNA plantilla de: ${templates.join(", ")}.
            - para 'drake': text0 es lo que rechaza, text1 lo que aprueba.
            - para 'distracted': text0 novio, text1 chica nueva, text2 novia actual.
            - para 'two_buttons': text0 boton1, text1 boton2.
            Return ONLY JSON: { "templateId": "string", "texts": ["string", "string", ...] }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return JSON.parse(text.replace(/```json|```/g, "").trim());
    }

    // --- OPENAI IMPLEMENTATIONS ---

    async generateThemeOpenAI(battleName, options) {
        const openai = this.getOpenAI();
        if (!openai) throw new Error("No OpenAI API Key");

        console.log("AIService: Generating Battle Theme (OpenAI) for:", battleName);
        const optionsText = options.length > 0 ? `Options: ${options.map(o => o.name).join(", ")}` : "";
        const prompt = `Generate a color theme for a battle named "${battleName}" ${optionsText}. Return ONLY a JSON object with this structure: { "optionAColor": "#hex", "optionBColor": "#hex", "background": "valid css background value for a linear gradient" }. Ensure high contrast and vibrant colors suitable for a dark mode UI.`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a JSON generator." }, { role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
            response_format: { type: "json_object" }
        });

        return JSON.parse(completion.choices[0].message.content);
    }

    async generateMemeOpenAI(battleName, options) {
        const openai = this.getOpenAI();
        if (!openai) throw new Error("No OpenAI API Key");

        console.log("AIService: Generating Meme Context (OpenAI) for:", battleName);
        const templates = ["drake", "distracted", "two_buttons"];
        const optionsText = options.length > 0 ? `Options: ${options.map(o => o.name).join(", ")}` : "";

        const prompt = `Genera un contexto gracioso para un meme sobre una batalla llamada "${battleName}" ${optionsText}. 
            Elige UNA plantilla de: ${templates.join(", ")}.
            - para 'drake': text0 es lo que rechaza, text1 lo que aprueba.
            - para 'distracted': text0 novio, text1 chica nueva, text2 novia actual.
            - para 'two_buttons': text0 boton1, text1 boton2.
            Return ONLY JSON: { "templateId": "string", "texts": ["string", "string", ...] }`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a creative JSON generator." }, { role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
            response_format: { type: "json_object" }
        });

        return JSON.parse(completion.choices[0].message.content);
    }

    // --- FALLBACKS ---

    getFallbackMemeContext(battleName, options) {
        const isDrake = Math.random() > 0.5;
        const [opt1, opt2] = options;
        if (isDrake) {
            return { templateId: 'drake', texts: [opt1.name, opt2.name] };
        } else {
            return { templateId: 'two_buttons', texts: [opt1.name, opt2.name] };
        }
    }

    getDefaultTheme() {
        return {
            optionAColor: "#ef4444",
            optionBColor: "#3b82f6",
            background: "linear-gradient(to right, #1f2937, #111827)"
        };
    }
}

module.exports = new AIService();
