require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { saveMessage } = require('./controllers/chatController'); 
const Feedback = require('./models/Feedback');
const CommunityMessage = require('./models/CommunityMessage');
const Setting = require('./models/Setting'); 

connectDB();
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- ROUTES ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));

// --- SETTINGS ROUTES ---

// 1. Stream Link (Specific)
app.get('/api/settings/stream', async (req, res) => {
    try {
        const setting = await Setting.findOne({ key: 'stream_link' });
        res.json({ link: setting ? setting.value : '' });
    } catch (err) { res.status(500).json(err); }
});

app.post('/api/settings/stream', async (req, res) => {
    try {
        const { link } = req.body;
        const setting = await Setting.findOneAndUpdate(
            { key: 'stream_link' },
            { value: link },
            { new: true, upsert: true }
        );
        res.json(setting);
    } catch (err) { res.status(500).json(err); }
});

// 2. Generic Settings (For WhatsApp/Discord/Other links)
app.get('/api/settings/:key', async (req, res) => {
    try {
        const setting = await Setting.findOne({ key: req.params.key });
        res.json({ value: setting ? setting.value : '' });
    } catch (err) { res.status(500).json(err); }
});

app.post('/api/settings/:key', async (req, res) => {
    try {
        const { value } = req.body;
        const setting = await Setting.findOneAndUpdate(
            { key: req.params.key },
            { value: value },
            { new: true, upsert: true }
        );
        res.json(setting);
    } catch (err) { res.status(500).json(err); }
});

// --- FEEDBACK ROUTES ---
app.get('/api/feedbacks', async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (err) { res.status(500).json(err); }
});

app.post('/api/feedbacks', async (req, res) => {
    try {
        const newFeedback = new Feedback(req.body);
        await newFeedback.save();
        res.status(201).json(newFeedback);
    } catch (err) { res.status(500).json(err); }
});

app.delete('/api/feedbacks/:id', async (req, res) => {
    try {
        await Feedback.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json(err); }
});

// --- SOCKET.IO SETUP ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  console.log(`⚡: User Connected ${socket.id}`);

  socket.on('join_room', (room) => {
    socket.join(room);
  });

  socket.on('send_message', async (data) => {
    const savedMsg = await saveMessage(data);
    if(savedMsg) {
        io.to(data.room).emit('receive_message', savedMsg);
    }
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
    
  // --- COMMUNITY CHAT LOGIC ---
  socket.on('join_community', () => {
    socket.join('community_room');
  });

  socket.on('send_community_message', async (data) => {
    try {
        const newMsg = new CommunityMessage(data);
        await newMsg.save();
        const populatedMsg = await CommunityMessage.findById(newMsg._id).populate('replyTo');
        io.to('community_room').emit('receive_community_message', populatedMsg);
    } catch (err) { console.error(err); }
  });

  socket.on('delete_community_message', async (id) => {
      await CommunityMessage.findByIdAndDelete(id);
      io.to('community_room').emit('message_deleted', id);
  });

  socket.on('react_message', async ({ msgId, emoji, userId }) => {
      io.to('community_room').emit('reaction_updated', { msgId, emoji, userId });
  });
});

app.get('/api/community/messages', async (req, res) => {
    const messages = await CommunityMessage.find().sort({ createdAt: 1 }).populate('replyTo');
    res.json(messages);
});

// --- SERVER START (VERCEL COMPATIBLE) ---
const PORT = process.env.PORT || 5000;

if (process.env.VERCEL) {
    module.exports = app;
} else {
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}