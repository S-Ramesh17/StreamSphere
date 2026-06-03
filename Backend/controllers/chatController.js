const ChatMessage = require('../models/ChatMessage');

const getRoomMessages = async (req, res) => {
  try {
    const { room } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const total = await ChatMessage.countDocuments({ room, isDeleted: false });
    const messages = await ChatMessage.find({ room, isDeleted: false })
      .populate('sender', 'username avatar role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      messages: messages.reverse(),
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { room, message, roomType = 'global' } = req.body;

    const chatMessage = await ChatMessage.create({
      sender: req.user._id,
      room,
      roomType,
      message,
    });

    const populated = await ChatMessage.findById(chatMessage._id).populate('sender', 'username avatar role');

    // Emit to room via socket
    if (req.io) {
      req.io.to(room).emit('chat:message', populated);
    }

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const msg = await ChatMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });

    if (req.user.role !== 'admin' && msg.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    msg.isDeleted = true;
    msg.deletedAt = Date.now();
    await msg.save();

    if (req.io) {
      req.io.to(msg.room).emit('chat:deleted', { messageId: msg._id });
    }

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getRoomMessages, sendMessage, deleteMessage };
