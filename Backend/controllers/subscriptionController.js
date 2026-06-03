const Subscription = require('../models/Subscription');

const PLAN_PRICES = { free: 0, basic: 8.99, premium: 15.99, family: 22.99 };

const getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id });
    if (!subscription) {
      const sub = await Subscription.create({ user: req.user._id, plan: 'free', status: 'active' });
      return res.json({ success: true, subscription: sub });
    }
    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const subscribe = async (req, res) => {
  try {
    const { plan, billingCycle = 'monthly' } = req.body;

    if (!['basic', 'premium', 'family'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    const price = billingCycle === 'yearly'
      ? PLAN_PRICES[plan] * 10 // 2 months free
      : PLAN_PRICES[plan];

    const endDate = new Date();
    if (billingCycle === 'yearly') endDate.setFullYear(endDate.getFullYear() + 1);
    else endDate.setMonth(endDate.getMonth() + 1);

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const subscription = await Subscription.findOneAndUpdate(
      { user: req.user._id },
      {
        plan,
        status: 'active',
        price,
        billingCycle,
        startDate: Date.now(),
        endDate,
        autoRenew: true,
        $push: {
          billingHistory: {
            amount: price,
            plan,
            date: Date.now(),
            status: 'paid',
            transactionId,
          },
        },
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, subscription, message: `Successfully subscribed to ${plan} plan` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const { reason } = req.body;
    const subscription = await Subscription.findOneAndUpdate(
      { user: req.user._id },
      {
        status: 'cancelled',
        autoRenew: false,
        cancelledAt: Date.now(),
        cancelReason: reason || '',
      },
      { new: true }
    );

    if (!subscription) return res.status(404).json({ success: false, message: 'No active subscription' });
    res.json({ success: true, subscription, message: 'Subscription cancelled. Access continues until end date.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBillingHistory = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id });
    if (!subscription) return res.json({ success: true, history: [] });
    res.json({ success: true, history: subscription.billingHistory.sort((a, b) => b.date - a.date) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 20, plan, status } = req.query;
    const query = {};
    if (plan) query.plan = plan;
    if (status) query.status = status;

    const total = await Subscription.countDocuments(query);
    const subscriptions = await Subscription.find(query)
      .populate('user', 'username email avatar')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, subscriptions, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMySubscription, subscribe, cancelSubscription, getBillingHistory, getAllSubscriptions };
