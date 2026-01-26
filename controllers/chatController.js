const Chat = require('../models/Chat');

// 1. Get Chat History
const getChats = async (req, res) => {
    try {
        const { room } = req.params;
        const chats = await Chat.find({ room }).sort({ createdAt: 1 }); // Oldest first
        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Save Message (Called internally by Socket)
const saveMessage = async (data) => {
    try {
        const newChat = new Chat(data);
        return await newChat.save();
    } catch (error) {
        console.error("Chat Save Error:", error);
        return null;
    }
};

module.exports = { getChats, saveMessage };