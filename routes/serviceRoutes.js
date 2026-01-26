const express = require('express');
const router = express.Router();
const { getServices, createService, deleteService } = require('../controllers/serviceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getServices); // Public
router.post('/', protect, admin, createService); // Admin Only
router.delete('/:id', protect, admin, deleteService); // Admin Only

module.exports = router;