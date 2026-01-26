const express = require('express');
const router = express.Router();
const { getLeaderboard, updateRank } = require('../controllers/leaderboardController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getLeaderboard); // Public
router.post('/', protect, admin, updateRank); // Admin Only

module.exports = router;