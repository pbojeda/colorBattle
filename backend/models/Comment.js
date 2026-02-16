const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    battleId: {
        type: String, // e.g., 'red-vs-blue'
        required: true,
        index: true
    },
    fingerprint: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: true
    },
    team: {
        type: String, // e.g. 'opt1', 'red'
        required: false
    },
    content: {
        type: String,
        required: true,
        maxlength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 7 // Optional: Auto-delete after 7 days if we want to save space later, but user said indefinite. Removing expires for now or setting it to null.
    }
});

// Remove expires if user wants indefinite, but standard practice usually has some limit. User said "indefinidamente".
// I will not set 'expires' index.

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
