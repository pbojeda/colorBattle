const express = require('express');
const router = express.Router();
const socialController = require('../controllers/SocialController');

// Comments
router.get('/battles/:id/comments', socialController.getComments);
router.post('/battles/:id/comments', socialController.postComment);

// Reactions
router.post('/battles/:id/reactions', socialController.postReaction);

module.exports = router;
