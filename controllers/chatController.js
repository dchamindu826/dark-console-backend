const ChatMessage = require('../models/ChatMessage'); // 🔥 නම හරියටම Import කරන්න

// 1. Get Chat History (By Room ID)
const getChats = async (req, res) => {
    try {
        const { room } = req.params;
        const chats = await ChatMessage.find({ room }).sort({ createdAt: 1 });
        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Save Message (Called internally by Socket)
const saveMessage = async (data) => {
  try {
    // 🔥 මෙතන කලින් තිබ්බේ 'ChatMessage' කියලා, ඒත් import කරල තිබ්බේ නෑ.
    // දැන් අපි උඩින් හරියට import කරපු නිසා මේක වැඩ කරයි.
    const newMessage = new ChatMessage({
      room: data.room,
      orderId: data.orderId, // Order ID එක අනිවාර්යයි
      author: data.author || data.senderName, // Backup name
      senderId: data.senderId,
      senderName: data.senderName,
      message: data.message,
      image: data.image, // 🔥 Images Save වෙන්න මේක ඕන
      type: data.type || 'text',
      isAdmin: data.isAdmin
    });
    
    await newMessage.save();
    return newMessage;
  } catch (error) {
    console.log("Save Message Error:", error); // Error එකක් ආවොත් බලාගන්න
    return null;
  }
};

module.exports = { getChats, saveMessage };