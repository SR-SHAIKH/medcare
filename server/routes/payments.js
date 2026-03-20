const express = require('express');
const {
    createRazorpayOrder,
    verifyRazorpayPayment
} = require('../controllers/payments');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/razorpay/order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

module.exports = router;
