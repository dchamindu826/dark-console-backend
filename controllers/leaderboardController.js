const Leaderboard = require('../models/Leaderboard'); 

// 1. Get All Players (Text Only - Super Fast 🚀)
const getLeaderboard = async (req, res) => {
  try {
    const players = await Leaderboard.find()
      .select('-image') // 🔥 Image එක අතහරිනවා
      .sort({ rank: 1 }); // Rank එක අනුව පිළිවෙලට
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Serve Player Image (NEW 🔥)
const getPlayerImage = async (req, res) => {
  try {
    const player = await Leaderboard.findById(req.params.id);
    
    if (!player || !player.image) {
       return res.status(404).send('Image not found');
    }

    // Base64 String එක Image එකක් බවට හරවනවා
    let mimeType = 'image/png';
    let base64Data = player.image;

    if (player.image.includes(",")) {
        const parts = player.image.split(",");
        if(parts[0].includes(":")) {
            mimeType = parts[0].split(":")[1].split(";")[0];
        }
        base64Data = parts[1];
    }

    const imgBuffer = Buffer.from(base64Data, 'base64');

    res.writeHead(200, {
      'Content-Type': mimeType,
      'Content-Length': imgBuffer.length
    });
    res.end(imgBuffer);

  } catch (error) {
    console.error("Error serving leaderboard image:", error);
    res.status(500).send('Server Error');
  }
};

// 3. Add Player (Uploads work as usual ✅)
const addPlayer = async (req, res) => {
  const { name, rank, points, image, game } = req.body; 

  try {
    const newPlayer = new Leaderboard({ 
        name, 
        rank, 
        points, 
        image, // Base64 Save වෙනවා
        game 
    });
    await newPlayer.save();
    res.status(201).json(newPlayer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 4. Delete Player (Missing in your code - Added here)
const deletePlayer = async (req, res) => {
  try {
    await Leaderboard.findByIdAndDelete(req.params.id);
    res.json({ message: "Player Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaderboard, getPlayerImage, addPlayer, deletePlayer };