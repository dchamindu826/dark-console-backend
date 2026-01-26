const Order = require('../models/Order');
const User = require('../models/User');
const Event = require('../models/Event');
const { sendTelegramMessage, notifySuperAdmin } = require('../utils/telegramService');

// 1. Get All Orders
const getOrders = async (req, res) => {
  const { status, type } = req.query;
  try {
    let query = {};
    if (status) query.status = status;
    if (type && type !== 'all') query.orderType = type;
    
    // Normal admins see only unassigned (pool) or their own jobs (unless super admin override logic is here, 
    // but usually getOrders is for the main list, so we keep basic filtering)
    if (req.user.role === 'admin') {
        // Option: Decide if normal admins can see ALL orders or just theirs. 
        // Usually, for "Orders" page, they might need to see Pool items to pick.
        // Keeping this flexible based on your existing logic.
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

    // --- EVENT CREW REGISTRATION ---
    if (order.orderType === 'event' && order.packageDetails.mode === 'crew') { 
         // 1. Generate Code
         const code = "TEAM-" + Math.random().toString(36).substring(2, 7).toUpperCase();
         order.crewCode = code;

         // 2. Add Team to Event Model
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
      // Notify the specific admin assigned
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

// 5. Create Order (🔥 UPDATED TELEGRAM MESSAGE STYLE)
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

    // --- 🔥 REFORMATTED TELEGRAM MESSAGE ---
    // Using clean HTML formatting without indentation issues
    const message = `
<b>🔔 NEW ORDER ALERT</b>
━━━━━━━━━━━━━━━━━━━
<b>👤 Customer:</b> ${savedOrder.customer.name}
<b>📞 Mobile:</b> ${savedOrder.customer.contact}

<b>📦 Package Details</b>
<b>• Item:</b> ${savedOrder.packageDetails.title}
<b>• Price:</b> LKR ${savedOrder.packageDetails.price}
<b>• Type:</b> ${savedOrder.orderType.toUpperCase()}
${savedOrder.crewName ? `<b>• Crew:</b> ${savedOrder.crewName}` : ''}

<b>🆔 Order ID:</b> #${savedOrder._id.toString().slice(-4)}
━━━━━━━━━━━━━━━━━━━
<i>👉 Please login to Admin Panel to verify slip.</i>
`;

    // Call the service function
    await notifySuperAdmin(message);
    // ----------------------------------------------------

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Order Creation Error:", error);
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

// 7. Get Admin Stats (🔥 SUPER ADMIN vs NORMAL ADMIN LOGIC)
const getAdminStats = async (req, res) => {
    try {
        const { role, _id } = req.user;

        // --- A. NORMAL ADMIN STATS ---
        if (role !== 'super-admin') {
            const assigned = await Order.countDocuments({ assignedAdmin: _id, status: 'in_progress' });
            const completed = await Order.countDocuments({ assignedAdmin: _id, status: 'completed' });
            const cancelled = await Order.countDocuments({ assignedAdmin: _id, status: 'cancelled' });
            
            // Pool count (Orders waiting to be picked)
            const poolCount = await Order.countDocuments({ status: 'pool' });

            return res.json({ 
                role: 'admin',
                assigned, 
                completed, 
                cancelled,
                poolCount
            });
        }

        // --- B. SUPER ADMIN STATS ---
        
        // 1. Total Counts
        const activeAdmins = await User.countDocuments({ role: { $in: ['admin', 'super-admin'] } });
        const completedOrders = await Order.countDocuments({ status: 'completed' });
        
        // 2. Revenue Calculation (Total, Events, Services)
        const revenueStats = await Order.aggregate([
            { $match: { status: 'completed' } },
            { 
                $group: { 
                    _id: null, 
                    totalRevenue: { $sum: "$packageDetails.price" },
                    eventRevenue: { 
                        $sum: { 
                            $cond: [{ $eq: ["$orderType", "event"] }, "$packageDetails.price", 0] 
                        } 
                    },
                    serviceRevenue: { 
                        $sum: { 
                            $cond: [{ $eq: ["$orderType", "service"] }, "$packageDetails.price", 0] 
                        } 
                    }
                } 
            }
        ]);

        const totalRev = revenueStats[0] || { totalRevenue: 0, eventRevenue: 0, serviceRevenue: 0 };

        // 3. Chart Data (Last 30 days revenue trend)
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

module.exports = { 
    getOrders, verifyPayment, assignOrder, updateJobStatus, createOrder, 
    getUserOrders, getAdminStats 
};