const Order = require('../models/Order');
const User = require('../models/User');
const Event = require('../models/Event');
const ChatMessage = require('../models/ChatMessage'); // 🔥 මේක නැති නිසා තමයි Server එක Crash වුනේ!
const { sendTelegramMessage, notifySuperAdmin } = require('../utils/telegramService');

// 1. Get All Orders
const getOrders = async (req, res) => {
  const { status, type } = req.query;
  try {
    let query = {};
    if (status) query.status = status;
    if (type && type !== 'all') query.orderType = type;
    
    // Admin logic if needed
    if (req.user.role === 'admin') {
        // ...
    }

    const orders = await Order.find(query)
        .select('-paymentSlip') 
        .populate('assignedAdmin', 'username')
        .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Serve Payment Slip Image
const getOrderPaymentSlip = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order || !order.paymentSlip) {
       return res.status(404).send('Slip not found');
    }

    let mimeType = 'image/png';
    let base64Data = order.paymentSlip;

    if (order.paymentSlip.includes(",")) {
        const parts = order.paymentSlip.split(",");
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
    console.error("Error serving slip:", error);
    res.status(500).send('Server Error');
  }
};

// 3. Verify Payment
const verifyPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = 'pool'; 

    if (order.orderType === 'event' && order.packageDetails.mode === 'crew') { 
          const code = "TEAM-" + Math.random().toString(36).substring(2, 7).toUpperCase();
          order.crewCode = code;

          const event = await Event.findById(order.packageDetails.eventId);
          
          if(event) {
              const newCrew = {
                  name: order.crewName || `${order.customer.name}'s Team`,
                  leaderId: order.userId,
                  leaderName: order.customer.name,
                  crewCode: code,
                  members: [{ userId: order.userId, name: order.customer.name }]
              };

              event.crews.push(newCrew);
              await event.save();
          }
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Assign Order
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

// 5. Update Job Status
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

// 6. Create Order
const createOrder = async (req, res) => {
  const { userId, customer, packageDetails, paymentSlip, orderType, crewName } = req.body; 

  try {
    const newOrder = new Order({
      userId: userId || null,
      customer,
      packageDetails,
      paymentSlip,
      orderType: orderType || 'service',
      crewName: crewName || null,
      status: 'pending'
    });

    const savedOrder = await newOrder.save();

    const message = `
<b>🔔 NEW ORDER ALERT</b>
━━━━━━━━━━━━━━━━━━━
<b>👤 Customer:</b> ${savedOrder.customer.name}
<b>📞 Mobile:</b> ${savedOrder.customer.contact}
<b>📦 Package:</b> ${savedOrder.packageDetails.title}
<b>💰 Price:</b> LKR ${savedOrder.packageDetails.price}
<b>🆔 Order ID:</b> #${savedOrder._id.toString().slice(-4)}
`;

    await notifySuperAdmin(message);
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 7. Get User Orders
const getUserOrders = async (req, res) => {
    try {
        const userId = req.query.uid || (req.user ? req.user._id : null);
        if (!userId) return res.status(400).json({ message: "User ID missing" });

        const orders = await Order.find({ userId: userId })
            .select('-paymentSlip') 
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 8. Get Admin Stats
const getAdminStats = async (req, res) => {
    try {
        const { role, _id } = req.user;

        if (role !== 'super-admin') {
            const assigned = await Order.countDocuments({ assignedAdmin: _id, status: 'in_progress' });
            const completed = await Order.countDocuments({ assignedAdmin: _id, status: 'completed' });
            const cancelled = await Order.countDocuments({ assignedAdmin: _id, status: 'cancelled' });
            const poolCount = await Order.countDocuments({ status: 'pool' });
            return res.json({ role: 'admin', assigned, completed, cancelled, poolCount });
        }

        const activeAdmins = await User.countDocuments({ role: { $in: ['admin', 'super-admin'] } });
        const completedOrders = await Order.countDocuments({ status: 'completed' });
        
        const revenueStats = await Order.aggregate([
            { $match: { status: 'completed' } },
            { 
                $group: { 
                    _id: null, 
                    totalRevenue: { $sum: "$packageDetails.price" },
                    eventRevenue: { $sum: { $cond: [{ $eq: ["$orderType", "event"] }, "$packageDetails.price", 0] } },
                    serviceRevenue: { $sum: { $cond: [{ $eq: ["$orderType", "service"] }, "$packageDetails.price", 0] } } 
                } 
            }
        ]);

        const totalRev = revenueStats[0] || { totalRevenue: 0, eventRevenue: 0, serviceRevenue: 0 };

        const chartData = await Order.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    income: { $sum: "$packageDetails.price" }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 30 }
        ]);

        res.json({
            role: 'super-admin',
            activeAdmins,
            completedOrders,
            totalRevenue: totalRev.totalRevenue,
            eventRevenue: totalRev.eventRevenue,
            serviceRevenue: totalRev.serviceRevenue,
            chartData
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔥 9. NEW: Get Chat Messages (Fix for 404 Error)
const getOrderMessages = async (req, res) => {
  try {
    const { id } = req.params;
    // ChatMessage model එක උඩින් import කරලා තියෙන්න ඕන
    const messages = await ChatMessage.find({ orderId: id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { 
    getOrders, verifyPayment, assignOrder, updateJobStatus, createOrder, 
    getUserOrders, getAdminStats, getOrderPaymentSlip, getOrderMessages // 🔥 Export added
};