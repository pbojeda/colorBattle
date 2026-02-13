const BattleService = require('../services/BattleService');

class BattleController {
    async listBattles(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const battles = await BattleService.getAllBattles(skip, limit);

            const battlesWithStats = battles.map(battle => {
                const totalVotes = battle.options.reduce((acc, opt) => acc + opt.votes, 0);
                return {
                    battleId: battle.battleId,
                    name: battle.name,
                    totalVotes,
                    options: battle.options.map(o => ({ id: o.id, name: o.name }))
                };
            });
            res.json(battlesWithStats);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error' });
        }
    }

    async listTrending(req, res) {
        try {
            const battles = await BattleService.getTrendingBattles(5);
            const battlesWithStats = battles.map(battle => {
                // totalVotes is already in aggregate result, but options logic stays same
                return {
                    battleId: battle.battleId,
                    name: battle.name,
                    totalVotes: battle.totalVotes,
                    options: battle.options.map(o => ({ id: o.id, name: o.name }))
                };
            });
            res.json(battlesWithStats);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error' });
        }
    }

    async getBattle(req, res) {
        try {
            const { battleId } = req.params;
            const { deviceId } = req.query;
            const battle = await BattleService.getBattleById(battleId);

            if (!battle) return res.status(404).json({ error: 'Battle not found' });

            const totalVotes = battle.options.reduce((acc, opt) => acc + opt.votes, 0);
            const optionsWithStats = battle.options.map(opt => ({
                id: opt.id,
                name: opt.name,
                votes: opt.votes,
                percentage: totalVotes === 0 ? 50 : Math.round((opt.votes / totalVotes) * 100)
            }));

            const userVote = deviceId && battle.votes ? battle.votes.get(deviceId) : null;

            res.json({
                battleId,
                options: optionsWithStats,
                totalVotes,
                userVote
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error' });
        }
    }

    async createBattle(req, res) {
        try {
            const { name, options } = req.body;
            if (!name || !options || options.length < 2) {
                return res.status(400).json({ error: 'Invalid battle data. Need name and at least 2 options.' });
            }

            const newBattle = await BattleService.createBattle({ name, options });
            res.status(201).json({
                battleId: newBattle.battleId,
                name: newBattle.name,
                message: 'Battle created successfully'
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error' });
        }
    }

    async vote(req, res) {
        try {
            const { battleId } = req.params;
            const { optionId, deviceId } = req.body;
            const io = req.app.get('io'); // Access io instance

            if (!optionId || !deviceId) {
                return res.status(400).json({ error: 'Missing optionId or deviceId' });
            }

            const result = await BattleService.vote(battleId, optionId, deviceId);

            if (!result) return res.status(404).json({ error: 'Battle not found' });
            if (result.message) return res.status(200).json(result);

            const battle = result.battle;

            // Prepare Broadcast Data
            const totalVotes = battle.options.reduce((acc, opt) => acc + opt.votes, 0);
            const optionsWithStats = battle.options.map(opt => ({
                id: opt.id,
                name: opt.name,
                votes: opt.votes,
                percentage: totalVotes === 0 ? 50 : Math.round((opt.votes / totalVotes) * 100)
            }));

            // Broadcast
            io.to(battleId).emit('vote_update', {
                battleId,
                options: optionsWithStats,
                totalVotes
            });

            res.json({ success: true, optionId });
        } catch (err) {
            console.error(err);
            if (err.message === 'Invalid option') return res.status(400).json({ error: err.message });
            res.status(500).json({ error: 'Server Error' });
        }
    }

    async deleteBattle(req, res) {
        try {
            const { battleId } = req.params;
            const result = await BattleService.deleteBattle(battleId);
            if (!result) return res.status(404).json({ error: 'Battle not found' });
            res.json({ message: 'Battle deleted' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error' });
        }
    }
}

module.exports = new BattleController();
