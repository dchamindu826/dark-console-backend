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
    getOrderMessages // 🔥 Import added
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// --- USER ROUTES ---
router.post('/', createOrder);
router.get('/myorders', getUserOrders); 

// Image & Message Routes (Public/Protected logic handled in controller/middleware)
router.get('/:id/payment-slip', getOrderPaymentSlip);
router.get('/:id/messages', getOrderMessages); // 🔥 This fixes the 404 Error

// --- ADMIN ROUTES ---
router.get('/admin/stats', protect, admin, getAdminStats); 

router.get('/', protect, admin, getOrders);
router.put('/:id/verify', protect, admin, verifyPayment);
router.put('/:id/assign', protect, admin, assignOrder);
router.put('/:id/status', protect, admin, updateJobStatus);

module.exports = router;