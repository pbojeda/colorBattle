const Battle = require('../../models/Battle');
const Comment = require('../../models/Comment');
const Reaction = require('../../models/Reaction');
const { v4: uuidv4 } = require('uuid');

// Funny names lists
const VOTED_PREFIXES = ['Team', 'Warrior', 'Fan', 'Defender', 'Captain', 'Super'];
const ANON_NAMES = ['Agente_007', 'Anon_Spectator', 'Ghost_Viewer', 'Mystery_Guest', 'Lurker_Max', 'Shadow_Walker'];

// Helper to generate funny nickname
const generateNickname = async (battleId, fingerprint) => {
    // 1. Check if user already has a nickname in this battle (optional consistency, but req says unique)
    // For now, let's generate a new one or try to reuse if we tracked it (we don't track nickname persistence per user yet, just per comment)

    // 2. Check if voted
    const battle = await Battle.findOne({ battleId });
    if (!battle) return 'Anon_' + uuidv4().substring(0, 4);

    const voteOptionId = battle.votes ? battle.votes.get(fingerprint) : null;

    if (voteOptionId) {
        // Find option name
        const option = battle.options.find(o => o.id === voteOptionId);
        const optionName = option ? option.name.replace(/\s+/g, '') : 'Unknown';
        const prefix = VOTED_PREFIXES[Math.floor(Math.random() * VOTED_PREFIXES.length)];
        return `${prefix}${optionName}_${Math.floor(Math.random() * 100)}`;
    } else {
        // Not voted
        const base = ANON_NAMES[Math.floor(Math.random() * ANON_NAMES.length)];
        return `${base}_${Math.floor(Math.random() * 1000)}`;
    }
};

exports.getComments = async (req, res) => {
    try {
        const { id } = req.params;
        const comments = await Comment.find({ battleId: id })
            .sort({ createdAt: -1 }) // Newest first
            .limit(50); // Limit to last 50 for performance
        res.status(200).json(comments);
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
};

exports.postComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { fingerprint, content, nickname: providedNickname } = req.body;

        if (!fingerprint || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (content.length > 200) {
            return res.status(400).json({ error: 'Character limit exceeded (max 200)' });
        }

        let finalNickname = providedNickname;

        // Validation/Generation Logic
        if (finalNickname) {
            const normalizedNickname = finalNickname.trim();

            // Check if anyone OTHER than this user is using this nickname in this battle
            const conflict = await Comment.findOne({
                battleId: id,
                nickname: { $regex: new RegExp(`^${normalizedNickname}$`, 'i') },
                fingerprint: { $ne: fingerprint }
            });

            if (conflict) {
                return res.status(400).json({
                    error: `El apodo "${normalizedNickname}" ya está en uso por otro guerrero. Elegí uno diferente.`
                });
            }
            finalNickname = normalizedNickname;
        } else {
            finalNickname = await generateNickname(id, fingerprint);
        }

        const battle = await Battle.findOne({ battleId: id });
        const userVote = battle?.votes?.get(fingerprint);

        const newComment = new Comment({
            battleId: id,
            fingerprint,
            nickname: finalNickname,
            team: userVote,
            content
        });

        await newComment.save();

        // Broadcast via Socket.io
        const io = req.app.get('io');
        if (io) {
            io.to(id).emit('chat:new_message', newComment);
        }

        res.status(201).json(newComment);
    } catch (err) {
        console.error('Error posting comment:', err);
        res.status(500).json({ error: 'Failed to post comment' });
    }
};

exports.postReaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { fingerprint, type, optionId } = req.body;

        if (!fingerprint || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newReaction = new Reaction({
            battleId: id,
            fingerprint,
            type,
            optionId
        });

        await newReaction.save();

        // Broadcast via Socket.io
        const io = req.app.get('io');
        if (io) {
            io.to(id).emit('battle:new_reaction', newReaction);
        }

        res.status(201).json(newReaction);
    } catch (err) {
        console.error('Error posting reaction:', err);
        res.status(500).json({ error: 'Failed to post reaction' });
    }
};
