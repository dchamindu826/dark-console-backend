const express = require('express');
const router = express.Router();
const { 
    getLeaderboard, 
    getPlayerImage, 
    addPlayer, 
    deletePlayer // 🔥 Import added
} = require('../controllers/leaderboardController');
const { protect, admin } = require('../middleware/authMiddleware');

// Get List (Text only)
router.get('/', getLeaderboard);

// 🔥 NEW: Image Link Route
router.get('/:id/image', getPlayerImage);

// Create Player (Protected)
router.post('/', protect, admin, addPlayer);

// Delete Player (Protected) - This was missing
router.delete('/:id', protect, admin, deletePlayer);

module.exports = router;