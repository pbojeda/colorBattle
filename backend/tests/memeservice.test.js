const fs = require('fs');
const path = require('path');

jest.mock('canvas', () => {
    const mCtx = {
        drawImage: jest.fn(),
        fillText: jest.fn(),
        strokeText: jest.fn(),
        measureText: jest.fn().mockReturnValue({ width: 50 }),
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        rotate: jest.fn(),
    };
    const mCanvas = {
        getContext: jest.fn().mockReturnValue(mCtx),
        toBuffer: jest.fn().mockReturnValue(Buffer.from('fake-image-data')),
    };
    return {
        createCanvas: jest.fn(() => mCanvas),
        loadImage: jest.fn().mockResolvedValue({ width: 100, height: 100 }),
        registerFont: jest.fn(),
    };
});

describe('MemeService', () => {
    let MemeService;

    beforeEach(() => {
        jest.resetModules();
        MemeService = require('../src/services/MemeService');
    });

    test('should load templates on initialization', () => {
        const templates = MemeService.getTemplates();
        expect(Array.isArray(templates)).toBe(true);
        expect(templates.length).toBeGreaterThan(0);
    });

    test('should generate a meme buffer for a valid template', async () => {
        const templates = MemeService.getTemplates();
        const templateId = templates[0].id;
        const texts = ['Text 1', 'Text 2'];

        const buffer = await MemeService.generateMeme(templateId, texts);

        expect(Buffer.isBuffer(buffer)).toBe(true);
        expect(buffer.toString()).toBe('fake-image-data');
    });

    test('should throw error for invalid template', async () => {
        await expect(MemeService.generateMeme('invalid-id', ['test']))
            .rejects.toThrow('Template not found');
    });

    test('should handle missing text by drawing empty string', async () => {
        const templates = MemeService.getTemplates();
        const templateId = templates[0].id;

        const buffer = await MemeService.generateMeme(templateId, []);
        expect(Buffer.isBuffer(buffer)).toBe(true);
    });
});
