const express = require('express');
const router = express.Router();

// Coupon Validate Route
router.post('/validate', (req, res) => {
  const { code } = req.body;
  
  // Example Coupons (Simple Logic)
  const coupons = {
    'DARK10': 10,  // 10% off
    'GAMER50': 50, // 50% off
    'WELCOME': 5   // 5% off
  };

  if (coupons[code]) {
    res.json({ success: true, discount: coupons[code] });
  } else {
    res.status(400).json({ success: false, message: "Invalid Coupon" });
  }
});

module.exports = router;