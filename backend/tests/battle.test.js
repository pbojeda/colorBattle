const mongoose = require('mongoose');
const BattleService = require('../src/services/BattleService');
const Battle = require('../models/Battle');
const AIService = require('../src/services/AIService');

// Mock AIService
jest.mock('../src/services/AIService');

describe('BattleService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createBattle', () => {
        it('should create a new battle with generated theme', async () => {
            const mockTheme = {
                optionAColor: '#123456',
                optionBColor: '#654321',
                background: 'linear-gradient(...)'
            };
            AIService.generateBattleTheme.mockResolvedValue(mockTheme);

            const battleData = {
                name: 'Test Battle',
                options: [{ name: 'Opt 1' }, { name: 'Opt 2' }]
            };

            const newBattle = await BattleService.createBattle(battleData);

            expect(newBattle).toBeDefined();
            expect(newBattle.name).toBe('Test Battle');
            expect(newBattle.theme).toEqual(mockTheme);
            expect(newBattle.battleId).toMatch(/test-battle-\d+/); // Check ID format
            expect(newBattle.options).toHaveLength(2);
            expect(newBattle.options[0].votes).toBe(0);
        });
    });

    describe('vote', () => {
        it('should register a vote correctly', async () => {
            // Setup: Create a battle deeply in DB (using service or directly)
            AIService.generateBattleTheme.mockResolvedValue({});
            const battle = await BattleService.createBattle({
                name: 'Vote Test',
                options: [{ name: 'A' }, { name: 'B' }]
            });

            const optionId = battle.options[0].id;
            const deviceId = 'device_123';

            const result = await BattleService.vote(battle.battleId, optionId, deviceId);

            expect(result.success).toBe(true);
            expect(result.battle.votes.get(deviceId)).toBe(optionId);
            expect(result.battle.options[0].votes).toBe(1);
        });

        it('should prevent double voting for the same option', async () => {
            AIService.generateBattleTheme.mockResolvedValue({});
            const battle = await BattleService.createBattle({
                name: 'Double Vote Test',
                options: [{ name: 'A' }, { name: 'B' }]
            });

            const optionId = battle.options[0].id;
            const deviceId = 'device_123';

            await BattleService.vote(battle.battleId, optionId, deviceId);
            const result = await BattleService.vote(battle.battleId, optionId, deviceId);

            expect(result.message).toBe('Already voted for this option');
            expect(result.battle.options[0].votes).toBe(1); // Should remain 1
        });

        it('should allow changing vote', async () => {
            AIService.generateBattleTheme.mockResolvedValue({});
            const battle = await BattleService.createBattle({
                name: 'Change Vote Test',
                options: [{ name: 'A' }, { name: 'B' }]
            });

            const optA = battle.options[0].id;
            const optB = battle.options[1].id;
            const deviceId = 'device_123';

            // Vote A
            await BattleService.vote(battle.battleId, optA, deviceId);

            // Change to B
            const result = await BattleService.vote(battle.battleId, optB, deviceId);

            expect(result.success).toBe(true);
            expect(result.battle.votes.get(deviceId)).toBe(optB);

            // Re-fetch to be sure
            const updatedBattle = await Battle.findOne({ battleId: battle.battleId });
            expect(updatedBattle.options[0].votes).toBe(0);
            expect(updatedBattle.options[1].votes).toBe(1);
        });
    });
});
