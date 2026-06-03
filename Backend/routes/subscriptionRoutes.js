const express = require('express');
const router = express.Router();
const { getMySubscription, subscribe, cancelSubscription, getBillingHistory, getAllSubscriptions } = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/auth');

router.get('/me', protect, getMySubscription);
router.get('/billing', protect, getBillingHistory);
router.get('/all', protect, authorize('admin'), getAllSubscriptions);
router.post('/subscribe', protect, subscribe);
router.post('/cancel', protect, cancelSubscription);

module.exports = router;
