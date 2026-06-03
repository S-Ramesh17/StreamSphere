const mongoose = require('mongoose');

const liveStreamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Stream title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: '',
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  thumbnail: {
    public_id: { type: String, default: '' },
    url: { type: String, default: '' },
  },
  streamKey: {
    type: String,
    unique: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended'],
    default: 'scheduled',
  },
  scheduledAt: { type: Date },
  startedAt: { type: Date },
  endedAt: { type: Date },
  viewerCount: { type: Number, default: 0 },
  peakViewers: { type: Number, default: 0 },
  totalViewers: { type: Number, default: 0 },
  isChatEnabled: { type: Boolean, default: true },
  requiredPlan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'family'],
    default: 'free',
  },
  tags: [{ type: String, trim: true }],
  recordingUrl: { type: String, default: '' },
}, { timestamps: true });

liveStreamSchema.pre('save', function (next) {
  if (!this.streamKey) {
    this.streamKey = require('crypto').randomBytes(16).toString('hex');
  }
  next();
});

module.exports = mongoose.model('LiveStream', liveStreamSchema);
