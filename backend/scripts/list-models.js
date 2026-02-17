require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // There isn't a direct listModels method on the client instance in some versions,
    // but let's try to infer or use the model manager if exposed.
    // Actually, the error message says "Call ListModels", which is an API endpoint.
    // The library usually has a way to do this.
    // Let's try a direct fetch to the API endpoint if the library doesn't expose it easily,
    // or just try 'gemini-1.0-pro' which is the specific version.

    // Try a known valid model name pattern
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-pro'];

    for (const modelName of models) {
        console.log(`Testing model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`SUCCESS: ${modelName} works!`);
            return;
        } catch (e) {
            console.log(`FAILED: ${modelName} - ${e.message.split(':')[0]}`);
        }
    }
}

listModels();
