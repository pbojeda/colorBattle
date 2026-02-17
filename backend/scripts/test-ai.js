require('dotenv').config();
const AIService = require('../src/services/AIService');

async function test() {
    console.log('Testing AI Service...');
    console.log('API Key present:', !!process.env.GEMINI_API_KEY);

    try {
        console.log('1. Testing Battle Theme Generation...');
        const theme = await AIService.generateBattleTheme('Test Battle', [{ name: 'Option 1' }, { name: 'Option 2' }]);
        console.log('Theme Result:', theme);
    } catch (e) {
        console.error('Theme generation failed:', e);
    }

    try {
        console.log('\n2. Testing Meme Context Generation...');
        const meme = await AIService.generateMemeContext('Test Battle', [{ name: 'Option 1' }, { name: 'Option 2' }]);
        console.log('Meme Result:', meme);
    } catch (e) {
        console.error('Meme generation failed:', e);
    }
}

test();
