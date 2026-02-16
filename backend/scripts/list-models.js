require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Dummy init to get access to global methods if needed, actually just need genAI instance?
        // Wait, the SDK doesn't have a direct "listModels" on the instance easily exposed in all versions.
        // Let's try to just use valid known models or check if there is a list method.
        // Actually, let's just try "gemini-pro" again but maybe the user's key is for a different region?
        // No, let's try a simple curl to listing if SDK is obscure.

        // Better: strict "gemini-1.5-flash-latest" or just "gemini-1.0-pro"
    } catch (e) {
        console.log(e);
    }
}

// Alternative: Use raw fetch to list models
async function listModelsRaw() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModelsRaw();
