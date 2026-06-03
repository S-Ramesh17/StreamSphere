const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  room: {
    type: String,
    required: true,
    index: true,
  },
  roomType: {
    type: String,
    enum: ['stream', 'global'],
    default: 'global',
  },
  message: {
    type: String,
    required: [true, 'Message cannot be empty'],
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
    trim: true,
  },
  messageType: {
    type: String,
    enum: ['text', 'system', 'emoji'],
    default: 'text',
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
}, { timestamps: true });

chatMessageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
