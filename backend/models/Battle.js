const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
    id: String,
    name: String,
    votes: { type: Number, default: 0 }
});

const BattleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    battleId: { type: String, required: true, unique: true },
    options: [OptionSchema],
    votes: {
        type: Map,
        of: String // deviceId -> optionId
    },
    emojis: {
        type: [String],
        default: ['🔥', '😂', '💩']
    },
    theme: {
        optionAColor: { type: String, default: "#ef4444" },
        optionBColor: { type: String, default: "#3b82f6" },
        background: { type: String, default: "linear-gradient(to right, #1f2937, #111827)" }
    }
});

module.exports = mongoose.model('Battle', BattleSchema);
