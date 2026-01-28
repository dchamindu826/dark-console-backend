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
    getOrderPaymentSlip // 🔥 Import
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// --- USER ROUTES ---
router.post('/', createOrder);
router.get('/myorders', getUserOrders); 

// 🔥 NEW: Image Link Route (Public access allow kara img tag eka wada karanna)
router.get('/:id/payment-slip', getOrderPaymentSlip);

// --- ADMIN ROUTES ---
router.get('/admin/stats', protect, admin, getAdminStats); 

router.get('/', protect, admin, getOrders);
router.put('/:id/verify', protect, admin, verifyPayment);
router.put('/:id/assign', protect, admin, assignOrder);
router.put('/:id/status', protect, admin, updateJobStatus);

module.exports = router;