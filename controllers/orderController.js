const Order = require('../models/Order');
const User = require('../models/User');
const Event = require('../models/Event'); // 🔥 IMPORT EVENT MODEL
const { sendTelegramMessage, notifySuperAdmin } = require('../utils/telegramService');

// 1. Get All Orders
const getOrders = async (req, res) => {
  const { status, type } = req.query;
  try {
    let query = {};
    if (status) query.status = status;
    if (type && type !== 'all') query.orderType = type;
    
    if (req.user.role === 'admin') {
        query.assignedAdmin = req.user._id;
    }

    const orders = await Order.find(query).populate('assignedAdmin', 'username').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Verify Payment (Approve & Register Team in Event)
const verifyPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = 'pool'; 

    // --- 🔥 FIX: EVENT CREW REGISTRATION ---
    if (order.orderType === 'event' && order.packageDetails.mode === 'crew') { 
         // 1. Generate Code
         const code = "TEAM-" + Math.random().toString(36).substring(2, 7).toUpperCase();
         order.crewCode = code;

         // 2. Add Team to Event Model
         const event = await Event.findById(order.packageDetails.eventId);
         
         if(event) {
             // Create Crew Object
             const newCrew = {
                 name: order.crewName || `${order.customer.name}'s Team`,
                 leaderId: order.userId,
                 leaderName: order.customer.name,
                 crewCode: code,
                 // Leader automatically becomes the first member
                 members: [{ userId: order.userId, name: order.customer.name }]
             };

             event.crews.push(newCrew);
             await event.save(); // Save Event with new Crew
             console.log("Crew Registered:", newCrew);
         }
    }
    // ---------------------------------------

    await order.save();
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 3. Assign Order
const assignOrder = async (req, res) => {
  const { adminId } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = 'in_progress';
    order.assignedAdmin = adminId;
    order.chatRoomId = `chat_${order._id}`;
    await order.save();

    const adminUser = await User.findById(adminId);
    if (adminUser && adminUser.telegramChatId) {
      sendTelegramMessage(adminUser.telegramChatId, `🚨 Job Assigned: ${order.packageDetails.title}`);
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Update Job Status
const updateJobStatus = async (req, res) => {
  const { status, reason } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    order.status = status;
    if (status === 'cancelled') order.cancellationReason = reason;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Create Order
const createOrder = async (req, res) => {
  const { userId, customer, packageDetails, paymentSlip, orderType, crewName } = req.body; 

  try {
    const newOrder = new Order({
      userId: userId || null,
      customer,
      packageDetails,
      paymentSlip,
      orderType: orderType || 'service',
      crewName: crewName || null, // Save Crew Name from frontend
      status: 'pending'
    });

    const savedOrder = await newOrder.save();
    notifySuperAdmin(`🚨 New Order: ${packageDetails.title}`);
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Get User Orders
const getUserOrders = async (req, res) => {
    try {
        const userId = req.query.uid || (req.user ? req.user._id : null);
        if (!userId) return res.status(400).json({ message: "User ID missing" });

        const orders = await Order.find({ userId: userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 7. Stats
const getAdminStats = async (req, res) => {
    try {
        const adminId = req.user._id;
        const assigned = await Order.countDocuments({ assignedAdmin: adminId, status: 'in_progress' });
        const completed = await Order.countDocuments({ assignedAdmin: adminId, status: 'completed' });
        const cancelled = await Order.countDocuments({ assignedAdmin: adminId, status: 'cancelled' });
        
        const totalRevenue = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: "$packageDetails.price" } } }
        ]);

        res.json({ assigned, completed, cancelled, totalRevenue: totalRevenue[0]?.total || 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getOrders, verifyPayment, assignOrder, updateJobStatus, createOrder, 
    getUserOrders, getAdminStats 
};