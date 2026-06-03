const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
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
  tags: [{ type: String, trim: true }],
  video: {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
    duration: { type: Number, default: 0 },
    format: { type: String, default: 'mp4' },
  },
  thumbnail: {
    public_id: { type: String, default: '' },
    url: { type: String, default: '' },
  },
  status: {
    type: String,
    enum: ['processing', 'published', 'draft', 'archived'],
    default: 'processing',
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'subscribers'],
    default: 'public',
  },
  requiredPlan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'family'],
    default: 'free',
  },
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isTrending: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  ageRestriction: { type: Boolean, default: false },
  language: { type: String, default: 'English' },
}, { timestamps: true });

videoSchema.index({ title: 'text', description: 'text', tags: 'text' });
videoSchema.index({ creator: 1, status: 1 });
videoSchema.index({ category: 1, status: 1 });
videoSchema.index({ views: -1 });
videoSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Video', videoSchema);
