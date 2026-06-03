const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'family'],
    default: 'free',
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'pending'],
    default: 'active',
  },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly', 'none'],
    default: 'none',
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  autoRenew: { type: Boolean, default: false },
  billingHistory: [
    {
      amount: { type: Number },
      plan: { type: String },
      date: { type: Date, default: Date.now },
      status: { type: String, enum: ['paid', 'failed', 'refunded'], default: 'paid' },
      transactionId: { type: String },
    },
  ],
  cancelledAt: { type: Date },
  cancelReason: { type: String, default: '' },
}, { timestamps: true });

const PLAN_PRICES = {
  free: 0,
  basic: 8.99,
  premium: 15.99,
  family: 22.99,
};

subscriptionSchema.statics.PLAN_PRICES = PLAN_PRICES;

module.exports = mongoose.model('Subscription', subscriptionSchema);
