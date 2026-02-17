require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testModels() {
    console.log('Testing specific models...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Candidates based on curl output
    const candidates = [
        "gemini-flash-latest",
        "models/gemini-flash-latest",
        "gemini-2.0-flash",
        "models/gemini-2.0-flash",
        "gemini-pro-latest"
    ];

    for (const modelName of candidates) {
        console.log(`\nAttemping: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you alive?");
            const response = await result.response;
            console.log(`✅ SUCCESS: ${modelName}`);
            console.log(`Response: ${response.text()}`);
            return; // Found a working one!
        } catch (e) {
            console.log(`❌ FAILED: ${modelName}`);
            console.log(`Error: ${e.message.split('\n')[0]}`);
        }
    }
}

testModels();
