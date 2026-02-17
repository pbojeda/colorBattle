const BattleService = require('../services/BattleService');

class BattleController {
    async listBattles(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const excludeIds = req.query.excludeIds ? req.query.excludeIds.split(',') : [];

            const battles = await BattleService.getAllBattles(skip, limit, excludeIds);

            const battlesWithStats = battles.map(battle => {
                const totalVotes = battle.options.reduce((acc, opt) => acc + opt.votes, 0);
                return {
                    battleId: battle.battleId,
                    name: battle.name,
                    theme: battle.theme,
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
                    theme: battle.theme,
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

            // Calculate raw percentages
            let optionsWithStats = battle.options.map(opt => ({
                id: opt.id,
                name: opt.name,
                votes: opt.votes,
                percentage: totalVotes === 0 ? 50 : (opt.votes / totalVotes) * 100
            }));

            // Smart Rounding to avoid 50/50 ties
            if (totalVotes > 0 && optionsWithStats.length === 2) {
                const [opt1, opt2] = optionsWithStats;

                // If votes are different but both round to 50%
                if (opt1.votes !== opt2.votes && Math.round(opt1.percentage) === 50) {
                    if (opt1.votes > opt2.votes) {
                        opt1.percentage = 51;
                        opt2.percentage = 49;
                    } else {
                        opt1.percentage = 49;
                        opt2.percentage = 51;
                    }
                } else {
                    opt1.percentage = Math.round(opt1.percentage);
                    opt2.percentage = Math.round(opt2.percentage);
                }
            } else {
                // Fallback for >2 options (simple round)
                optionsWithStats.forEach(o => o.percentage = Math.round(o.percentage));
            }

            const userVote = deviceId && battle.votes ? battle.votes.get(deviceId) : null;

            res.json({
                battleId,
                name: battle.name,
                theme: battle.theme,
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
                theme: newBattle.theme,
                options: newBattle.options,
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

            // Calculate raw percentages
            let optionsWithStats = battle.options.map(opt => ({
                id: opt.id,
                name: opt.name,
                votes: opt.votes,
                percentage: totalVotes === 0 ? 50 : (opt.votes / totalVotes) * 100
            }));

            // Smart Rounding to avoid 50/50 ties
            if (totalVotes > 0 && optionsWithStats.length === 2) {
                const [opt1, opt2] = optionsWithStats;

                // If votes are different but both round to 50%
                if (opt1.votes !== opt2.votes && Math.round(opt1.percentage) === 50) {
                    if (opt1.votes > opt2.votes) {
                        opt1.percentage = 51;
                        opt2.percentage = 49;
                    } else {
                        opt1.percentage = 49;
                        opt2.percentage = 51;
                    }
                } else {
                    opt1.percentage = Math.round(opt1.percentage);
                    opt2.percentage = Math.round(opt2.percentage);
                }
            } else {
                // Fallback for >2 options (simple round)
                optionsWithStats.forEach(o => o.percentage = Math.round(o.percentage));
            }

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

    async getMeme(req, res) {
        try {
            const { battleId } = req.params;
            const battle = await BattleService.getBattleById(battleId);
            if (!battle) return res.status(404).json({ error: 'Battle not found' });

            // 1. Generate Context (Text + Template Selection) via AI
            // In a real app, we might want to cache this in the DB so we don't regenerate every time
            const memeContext = await require('../services/AIService').generateMemeContext(battle.name, battle.options);

            if (!memeContext) {
                return res.status(500).json({ error: 'Failed to generate meme context' });
            }

            // 2. Generate Image via MemeService
            const imageBuffer = await require('../services/MemeService').generateMeme(memeContext.templateId, memeContext.texts);

            // 3. Return Image
            res.writeHead(200, {
                'Content-Type': 'image/jpeg',
                'Content-Length': imageBuffer.length
            });
            res.end(imageBuffer);

        } catch (err) {
            console.error("Meme Generation Error:", err);
            res.status(500).json({ error: 'Server Error generating meme' });
        }
    }
}

module.exports = new BattleController();
