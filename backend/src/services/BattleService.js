const Battle = require('../../models/Battle');

class BattleService {
    async getAllBattles(skip = 0, limit = 10) {
        return await Battle.find({}, 'battleId name options votes')
            .skip(skip)
            .limit(limit);
    }

    async getTrendingBattles(limit = 5) {
        // Since votes are inside options array, simple sort is hard in Mongo without aggregation
        // For MVP, fetch all (or a reasonable chunk) and sort in memory if dataset is small
        // OR better: use aggregation

        return await Battle.aggregate([
            {
                $addFields: {
                    totalVotes: { $sum: "$options.votes" }
                }
            },
            { $sort: { totalVotes: -1 } },
            { $limit: limit },
            { $project: { battleId: 1, name: 1, options: 1, votes: 1, totalVotes: 1 } }
        ]);
    }

    async getBattleById(battleId) {
        return await Battle.findOne({ battleId });
    }

    async createBattle(battleData) {
        const { name, options } = battleData;
        const battleId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

        const newBattle = new Battle({
            name,
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
