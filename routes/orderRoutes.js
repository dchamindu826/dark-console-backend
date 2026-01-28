const express = require('express');
const router = express.Router();
const { 
    getOrders, 
    verifyPayment, 
    assignOrder, 
    updateJobStatus, 
    createOrder, 
    getUserOrders,
    getAdminStats,
    getOrderPaymentSlip, 
    getOrderMessages // 🔥 අලුතින් එකතු කළා (Controller එකෙන් Import කරා)
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// --- USER ROUTES ---
router.post('/', createOrder);
router.get('/myorders', getUserOrders); 

// 🔥 Payment Slip Image Route
router.get('/:id/payment-slip', getOrderPaymentSlip);

// 🔥 Chat Messages Route (මේක නැති නිසා තමයි 404 ආවේ - දැන් හරි)
router.get('/:id/messages', getOrderMessages);

// --- ADMIN ROUTES ---
router.get('/admin/stats', protect, admin, getAdminStats); 

router.get('/', protect, admin, getOrders);
router.put('/:id/verify', protect, admin, verifyPayment);
router.put('/:id/assign', protect, admin, assignOrder);
router.put('/:id/status', protect, admin, updateJobStatus);

module.exports = router;