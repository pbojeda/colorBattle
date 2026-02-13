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
    }
});

module.exports = mongoose.model('Battle', BattleSchema);
