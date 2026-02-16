const Battle = require('../../models/Battle');
const AIService = require('./AIService');

class BattleService {
    // Updated: Accept excludeIds to filter out trending items from main list
    async getAllBattles(skip = 0, limit = 10, excludeIds = []) {
        // Use aggregation to:
        // 1. Calculate totalVotes
        // 2. Filter out excluded IDs
        // 3. Sort by totalVotes (or creation date, user asked for votes)
        // 4. Implement pagination
        return await Battle.aggregate([
            {
                $match: {
                    battleId: { $nin: excludeIds }
                }
            },
            {
                $addFields: {
                    totalVotes: { $sum: "$options.votes" }
                }
            },
            { $sort: { totalVotes: -1 } }, // Sorted by votes
            { $skip: skip },
            { $limit: limit },
            { $project: { battleId: 1, name: 1, options: 1, votes: 1, totalVotes: 1, theme: 1 } }
        ]);
    }

    async getTrendingBattles(limit = 5) {
        return await Battle.aggregate([
            {
                $addFields: {
                    totalVotes: { $sum: "$options.votes" }
                }
            },
            { $sort: { totalVotes: -1 } },
            { $limit: limit },
            { $project: { battleId: 1, name: 1, options: 1, votes: 1, totalVotes: 1, theme: 1 } }
        ]);
    }

    async getBattleById(battleId) {
        let battle = await Battle.findOne({ battleId });

        // Lazy Generation: If theme is default (heuristic check), try to generate it
        if (battle && this.isDefaultTheme(battle.theme)) {
            console.log(`Lazy generating theme for ${battle.name}...`);
            const newTheme = await AIService.generateBattleTheme(battle.name, battle.options);

            // If newTheme differs from default, update DB
            if (!this.isDefaultTheme(newTheme)) {
                battle.theme = newTheme;
                await battle.save();
                console.log(`Theme updated for ${battle.name}`);
            }
        }

        return battle;
    }

    isDefaultTheme(theme) {
        if (!theme) return true;
        // Simple check against default Red/Blue values
        return theme.optionAColor === "#ef4444" && theme.optionBColor === "#3b82f6";
    }

    async createBattle(battleData) {
        const { name, options } = battleData;
        const battleId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

        // Generate Theme via AI
        const theme = await AIService.generateBattleTheme(name, options);

        const newBattle = new Battle({
            name,
            theme,
            battleId,
            options: options.map((opt, idx) => ({
                id: `opt${idx + 1}`,
                name: opt.name,
                votes: 0
            })),
            votes: {}
        });

        return await newBattle.save();
    }

    async vote(battleId, optionId, deviceId) {
        const battle = await Battle.findOne({ battleId });
        if (!battle) return null;

        const previousVote = battle.votes.get(deviceId);

        if (previousVote === optionId) {
            return { message: 'Already voted for this option', battle };
        }

        if (previousVote) {
            const oldOption = battle.options.find(o => o.id === previousVote);
            if (oldOption) oldOption.votes--;
        }

        const newOption = battle.options.find(o => o.id === optionId);
        if (!newOption) throw new Error('Invalid option');

        newOption.votes++;
        battle.votes.set(deviceId, optionId);

        await battle.save();
        return { success: true, battle };
    }

    async deleteBattle(battleId) {
        return await Battle.findOneAndDelete({ battleId });
    }
}

module.exports = new BattleService();
