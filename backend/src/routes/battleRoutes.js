const express = require('express');
const router = express.Router();
const BattleController = require('../controllers/BattleController');

router.get('/battles/trending', BattleController.listTrending);
router.get('/battles', BattleController.listBattles);
router.post('/battles', BattleController.createBattle);
router.get('/battle/:battleId', BattleController.getBattle);
router.post('/battle/:battleId/vote', BattleController.vote);
router.delete('/battle/:battleId', BattleController.deleteBattle); // Helper for cleanup
router.get('/battle/:battleId/meme', BattleController.getMeme);

module.exports = router;
