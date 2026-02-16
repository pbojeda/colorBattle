const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
    battleId: {
        type: String,
        required: true,
        index: true
    },
    optionId: {
        type: String, // Optional: if reacting to a specific side (e.g. Red)
        required: false
    },
    fingerprint: {
        type: String,
        required: true
    },
    type: {
        type: String, // e.g., '🔥', '😂'
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Reaction = mongoose.model('Reaction', reactionSchema);

module.exports = Reaction;
