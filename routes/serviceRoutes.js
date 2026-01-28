const express = require('express');
const router = express.Router();
const { getServices, getServiceImage, createService, deleteService } = require('../controllers/serviceController');

// Main List (Text only)
router.get('/', getServices);

// 🔥 Image Link Route (මේක Frontend එකේ img src එකට දාන්න ඕන)
router.get('/:id/image', getServiceImage);

router.post('/', createService);
router.delete('/:id', deleteService);

module.exports = router;