const express = require('express');
const router = express.Router();
const { getLeaderboard, getPlayerImage, addPlayer } = require('../controllers/leaderboardController');

// Get List (Text only)
router.get('/', getLeaderboard);

// 🔥 NEW: Image Link Route
router.get('/:id/image', getPlayerImage);

// Create Player
router.post('/', addPlayer);

module.exports = router;