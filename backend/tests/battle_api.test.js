const request = require('supertest');
const { app } = require('../server');
const AIService = require('../src/services/AIService');
const Battle = require('../models/Battle');

jest.mock('../src/services/AIService');

describe('Battle API Integration Tests', () => {
    let battleId;

    beforeEach(async () => {
        await Battle.deleteMany({});
        AIService.generateBattleTheme.mockResolvedValue({
            optionAColor: '#ff0000',
            optionBColor: '#0000ff',
            background: 'linear-gradient(to right, #000, #333)'
        });
    });

    describe('POST /api/battles', () => {
        test('should create a battle with valid data', async () => {
            const res = await request(app)
                .post('/api/battles')
                .send({
                    name: 'API Test Battle',
                    options: [{ name: 'Option A' }, { name: 'Option B' }]
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.name).toBe('API Test Battle');
            expect(res.body.battleId).toBeDefined();
            battleId = res.body.battleId;
        });

        test('should return 400 if name is missing', async () => {
            const res = await request(app)
                .post('/api/battles')
                .send({
                    options: [{ name: 'A' }, { name: 'B' }]
                });

            expect(res.statusCode).toEqual(400);
        });

        test('should return 400 if fewer than 2 options are provided', async () => {
            const res = await request(app)
                .post('/api/battles')
                .send({
                    name: 'Invalid Battle',
                    options: [{ name: 'Only One' }]
                });

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('GET /api/battle/:battleId', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/battles')
                .send({
                    name: 'Fetch Test',
                    options: [{ name: 'A' }, { name: 'B' }]
                });
            battleId = res.body.battleId;
        });

        test('should fetch an existing battle', async () => {
            const res = await request(app).get(`/api/battle/${battleId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.battleId).toEqual(battleId);
        });

        test('should return 404 for non-existent battle', async () => {
            const res = await request(app).get('/api/battle/non-existent-123');
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('POST /api/battle/:battleId/vote', () => {
        let optAId;
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/battles')
                .send({
                    name: 'Vote API Test',
                    options: [{ name: 'A' }, { name: 'B' }]
                });
            battleId = res.body.battleId;
            optAId = res.body.options[0].id;
        });

        test('should allow voting', async () => {
            const res = await request(app)
                .post(`/api/battle/${battleId}/vote`)
                .send({
                    optionId: optAId,
                    deviceId: 'test-device'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });

        test('should return 400 for invalid optionId', async () => {
            const res = await request(app)
                .post(`/api/battle/${battleId}/vote`)
                .send({
                    optionId: 'invalid-opt',
                    deviceId: 'test-device'
                });

            expect(res.statusCode).toEqual(400);
        });
    });
});
