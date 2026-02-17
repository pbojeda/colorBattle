const AIService = require('../src/services/AIService');
const { GoogleGenerativeAI } = require("@google/generative-ai");

jest.mock("@google/generative-ai");

describe('AIService', () => {
    let mockGenerateContent;

    beforeEach(() => {
        jest.clearAllMocks();
        mockGenerateContent = jest.fn();

        GoogleGenerativeAI.mockImplementation(() => ({
            getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: mockGenerateContent
            })
        }));

        // Reset the internal state of AIService if necessary
        AIService.genAI = null;
        process.env.GEMINI_API_KEY = 'test-key';
    });

    test('should return a valid theme when Gemini returns proper JSON', async () => {
        const mockResponse = {
            response: {
                text: () => '```json\n{ "optionAColor": "#111111", "optionBColor": "#222222", "background": "gradient" }\n```'
            }
        };
        mockGenerateContent.mockResolvedValue(mockResponse);

        const theme = await AIService.generateBattleTheme('Test Battle', [{ name: 'A' }, { name: 'B' }]);

        expect(theme.optionAColor).toBe('#111111');
        expect(theme.optionBColor).toBe('#222222');
        expect(mockGenerateContent).toHaveBeenCalled();
    });

    test('should return default theme if Gemini fails', async () => {
        mockGenerateContent.mockRejectedValue(new Error('API Error'));

        // Silence console.error for tests
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

        const theme = await AIService.generateBattleTheme('Test Battle');

        expect(theme).toEqual(AIService.getDefaultTheme());
        expect(mockGenerateContent).toHaveBeenCalledTimes(1);

        errorSpy.mockRestore();
        logSpy.mockRestore();
    });

    test('should handle malformed JSON and retry/fallback', async () => {
        const mockResponse = {
            response: {
                text: () => 'Invalid JSON'
            }
        };
        mockGenerateContent.mockResolvedValue(mockResponse);

        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        const theme = await AIService.generateBattleTheme('Test Battle');

        expect(theme).toEqual(AIService.getDefaultTheme());

        errorSpy.mockRestore();
    });

    test('should return default theme immediately if no API key is present', async () => {
        delete process.env.GEMINI_API_KEY;
        AIService.genAI = null;

        const theme = await AIService.generateBattleTheme('Test Battle');
        expect(theme).toEqual(AIService.getDefaultTheme());
        expect(GoogleGenerativeAI).not.toHaveBeenCalled();
    });
});
