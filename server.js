require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { saveMessage } = require('./controllers/chatController'); 
const Feedback = require('./models/Feedback');


// 🔥 1. IMPORT SETTING MODEL
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

// 🔥 2. ADD SETTINGS ROUTES HERE (Stream Link)
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
});


// --- FEEDBACK ROUTES ---
// Get All
app.get('/api/feedbacks', async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (err) { res.status(500).json(err); }
});

// Create Feedback (Admin)
app.post('/api/feedbacks', async (req, res) => {
    try {
        const newFeedback = new Feedback(req.body);
        await newFeedback.save();
        res.status(201).json(newFeedback);
    } catch (err) { res.status(500).json(err); }
});

// Delete Feedback (Admin)
app.delete('/api/feedbacks/:id', async (req, res) => {
    try {
        await Feedback.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json(err); }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));