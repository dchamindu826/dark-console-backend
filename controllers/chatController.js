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
    const newMessage = new ChatMessage({
      room: data.room,
      orderId: data.orderId,
      author: data.author,
      senderId: data.senderId,
      senderName: data.senderName,
      message: data.message,
      // 🔥 මේ ලයින් එක තියෙනවද බලන්න:
      image: data.image, 
      type: data.type || 'text',
      isAdmin: data.isAdmin
    });
    
    await newMessage.save();
    return newMessage;
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = { getChats, saveMessage };