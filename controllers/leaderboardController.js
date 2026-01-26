const Leaderboard = require('../models/Leaderboard');

// Get All
const getLeaderboard = async (req, res) => {
    try {
        const players = await Leaderboard.find().sort({ rank: 1 });
        res.json(players);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update or Create a Rank
const updateRank = async (req, res) => {
    const { rank, name, points, avatar } = req.body;
    try {
        // Find by rank and update, or create if not exists (upsert)
        const player = await Leaderboard.findOneAndUpdate(
            { rank },
            { name, points, avatar },
            { new: true, upsert: true }
        );
        res.json(player);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getLeaderboard, updateRank };