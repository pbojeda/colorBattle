const request = require('supertest');
const { app } = require('../server');
const Battle = require('../models/Battle');
const Comment = require('../models/Comment');
const AIService = require('../src/services/AIService');

jest.mock('../src/services/AIService');

describe('Social API Integration Tests', () => {
    let battleId;

    beforeEach(async () => {
        await Battle.deleteMany({});
        await Comment.deleteMany({});
        AIService.generateBattleTheme.mockResolvedValue({
            optionAColor: '#ff0000',
            optionBColor: '#0000ff',
            background: 'linear-gradient(to right, #000, #333)'
        });
        const res = await request(app)
            .post('/api/battles')
            .send({
                name: 'Social Test Battle',
                options: [{ name: 'A' }, { name: 'B' }]
            });
        battleId = res.body.battleId;
    });

    describe('POST /api/battles/:battleId/comments', () => {
        test('should allow posting a comment', async () => {
            const res = await request(app)
                .post(`/api/battles/${battleId}/comments`)
                .send({
                    fingerprint: 'user-1',
                    content: 'Hello Battle!',
                    nickname: 'Player1'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.content).toBe('Hello Battle!');
        });

        test('should return 400 if content is missing', async () => {
            const res = await request(app)
                .post(`/api/battles/${battleId}/comments`)
                .send({
                    fingerprint: 'user-1',
                    nickname: 'Player1'
                });

            expect(res.statusCode).toEqual(400);
        });

        test('should return 400 if content is too long (> 200 chars)', async () => {
            const res = await request(app)
                .post(`/api/battles/${battleId}/comments`)
                .send({
                    fingerprint: 'user-1',
                    content: 'A'.repeat(201),
                    nickname: 'Player1'
                });

            expect(res.statusCode).toEqual(400);
        });

        test('should return 400 if nickname is taken by different fingerprint', async () => {
            // First comment
            await request(app)
                .post(`/api/battles/${battleId}/comments`)
                .send({
                    fingerprint: 'user-1',
                    content: 'First!',
                    nickname: 'Shadow'
                });

            // Second comment with same nickname but different fingerprint
            const res = await request(app)
                .post(`/api/battles/${battleId}/comments`)
                .send({
                    fingerprint: 'user-2',
                    content: 'I want that name',
                    nickname: 'Shadow'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toMatch(/uso|taken/);
        });
    });

    describe('GET /api/battles/:battleId/comments', () => {
        test('should fetch comments for a battle', async () => {
            await request(app)
                .post(`/api/battles/${battleId}/comments`)
                .send({
                    fingerprint: 'user-1',
                    content: 'Comment 1',
                    nickname: 'P1'
                });

            const res = await request(app).get(`/api/battles/${battleId}/comments`);
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });
});
