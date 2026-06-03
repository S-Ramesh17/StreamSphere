const LiveStream = require('../models/LiveStream');
const { uploadImage, deleteFromCloudinary } = require('../middleware/upload');

const getStreams = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;
    else query.status = { $in: ['live', 'scheduled'] };

    const total = await LiveStream.countDocuments(query);
    const streams = await LiveStream.find(query)
      .populate('creator', 'username avatar')
      .populate('category', 'name slug color')
      .sort({ status: -1, scheduledAt: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, streams, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStream = async (req, res) => {
  try {
    const stream = await LiveStream.findById(req.params.id)
      .populate('creator', 'username avatar bio followers')
      .populate('category', 'name slug color');

    if (!stream) return res.status(404).json({ success: false, message: 'Stream not found' });
    res.json({ success: true, stream });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createStream = async (req, res) => {
  try {
    const { title, description, category, scheduledAt, tags, requiredPlan, isChatEnabled } = req.body;
    let thumbnail = {};

    if (req.file) {
      const result = await uploadImage(req.file.buffer, 'streamsphere/streams');
      thumbnail = { public_id: result.public_id, url: result.secure_url };
    }

    const stream = await LiveStream.create({
      title,
      description,
      creator: req.user._id,
      category: category || undefined,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      requiredPlan: requiredPlan || 'free',
      isChatEnabled: isChatEnabled !== 'false',
      thumbnail,
      status: 'scheduled',
    });

    const populated = await LiveStream.findById(stream._id)
      .populate('creator', 'username avatar')
      .populate('category', 'name slug');

    res.status(201).json({ success: true, stream: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateStream = async (req, res) => {
  try {
    const stream = await LiveStream.findById(req.params.id);
    if (!stream) return res.status(404).json({ success: false, message: 'Stream not found' });

    if (req.user.role !== 'admin' && stream.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, description, category, scheduledAt, tags, requiredPlan, isChatEnabled } = req.body;
    if (title) stream.title = title;
    if (description !== undefined) stream.description = description;
    if (category) stream.category = category;
    if (scheduledAt) stream.scheduledAt = new Date(scheduledAt);
    if (tags) stream.tags = tags.split(',').map(t => t.trim());
    if (requiredPlan) stream.requiredPlan = requiredPlan;
    if (isChatEnabled !== undefined) stream.isChatEnabled = isChatEnabled !== 'false';

    if (req.file) {
      if (stream.thumbnail.public_id) await deleteFromCloudinary(stream.thumbnail.public_id);
      const result = await uploadImage(req.file.buffer, 'streamsphere/streams');
      stream.thumbnail = { public_id: result.public_id, url: result.secure_url };
    }

    await stream.save();
    const updated = await LiveStream.findById(stream._id)
      .populate('creator', 'username avatar')
      .populate('category', 'name slug');

    res.json({ success: true, stream: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const startStream = async (req, res) => {
  try {
    const stream = await LiveStream.findById(req.params.id);
    if (!stream) return res.status(404).json({ success: false, message: 'Stream not found' });

    if (stream.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    stream.status = 'live';
    stream.startedAt = Date.now();
    await stream.save();

    // Notify via socket
    if (req.io) {
      req.io.emit('stream:started', { streamId: stream._id, title: stream.title, creator: stream.creator });
    }

    res.json({ success: true, stream });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const endStream = async (req, res) => {
  try {
    const stream = await LiveStream.findById(req.params.id);
    if (!stream) return res.status(404).json({ success: false, message: 'Stream not found' });

    if (stream.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    stream.status = 'ended';
    stream.endedAt = Date.now();
    await stream.save();

    if (req.io) {
      req.io.to(`stream:${stream._id}`).emit('stream:ended', { streamId: stream._id });
    }

    res.json({ success: true, stream });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteStream = async (req, res) => {
  try {
    const stream = await LiveStream.findById(req.params.id);
    if (!stream) return res.status(404).json({ success: false, message: 'Stream not found' });

    if (req.user.role !== 'admin' && stream.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (stream.thumbnail.public_id) await deleteFromCloudinary(stream.thumbnail.public_id);
    await LiveStream.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Stream deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCreatorStreams = async (req, res) => {
  try {
    const streams = await LiveStream.find({ creator: req.user._id })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });
    res.json({ success: true, streams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStreams, getStream, createStream, updateStream, startStream, endStream, deleteStream, getCreatorStreams };
