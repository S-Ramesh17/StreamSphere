const Video = require('../models/Video');
const Category = require('../models/Category');
const WatchHistory = require('../models/WatchHistory');
const { uploadImage, uploadVideo, deleteFromCloudinary } = require('../middleware/upload');

// @desc    Get all published videos (public)
const getVideos = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, sort = 'newest', trending, featured } = req.query;
    const query = { status: 'published', visibility: { $in: ['public', 'subscribers'] } };

    if (category) query.category = category;
    if (trending === 'true') query.isTrending = true;
    if (featured === 'true') query.isFeatured = true;
    if (search) query.$text = { $search: search };

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      views: { views: -1 },
      likes: { likesCount: -1 },
    };

    const total = await Video.countDocuments(query);

    // For likes sort, use aggregation; otherwise use find
    let videos;
    if (sort === 'likes') {
      videos = await Video.aggregate([
        { $match: query },
        { $addFields: { likesCount: { $size: '$likes' } } },
        { $sort: { likesCount: -1 } },
        { $skip: (page - 1) * parseInt(limit) },
        { $limit: parseInt(limit) },
        { $lookup: { from: 'users', localField: 'creator', foreignField: '_id', as: 'creator' } },
        { $unwind: { path: '$creator', preserveNullAndEmpty: true } },
        { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
        { $unwind: { path: '$category', preserveNullAndEmpty: true } },
        { $project: { 'creator.password': 0 } },
      ]);
    } else {
      videos = await Video.find(query)
        .populate('creator', 'username avatar')
        .populate('category', 'name slug color')
        .sort(sortOptions[sort] || sortOptions.newest)
        .skip((page - 1) * parseInt(limit))
        .limit(parseInt(limit));
    }

    res.json({
      success: true,
      videos,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single video
const getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('creator', 'username avatar bio followers')
      .populate('category', 'name slug color');

    if (!video || video.status === 'archived') {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Increment views
    await Video.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Save watch history if authenticated
    if (req.user) {
      await WatchHistory.findOneAndUpdate(
        { user: req.user._id, video: video._id },
        { watchedAt: Date.now(), user: req.user._id, video: video._id },
        { upsert: true, new: true }
      );
    }

    // Get related videos
    const related = await Video.find({
      _id: { $ne: video._id },
      category: video.category,
      status: 'published',
    })
      .populate('creator', 'username avatar')
      .limit(8);

    res.json({ success: true, video, related });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload video (Creator/Admin)
const uploadVideoContent = async (req, res) => {
  try {
    if (!req.files || !req.files.video) {
      return res.status(400).json({ success: false, message: 'Video file is required' });
    }

    const { title, description, category, tags, visibility, requiredPlan, language } = req.body;

    // Upload video to Cloudinary
    const videoResult = await uploadVideo(req.files.video[0].buffer);

    let thumbnailResult = null;
    if (req.files.thumbnail) {
      thumbnailResult = await uploadImage(req.files.thumbnail[0].buffer, 'streamsphere/thumbnails');
    }

    const video = await Video.create({
      title,
      description,
      creator: req.user._id,
      category: category || undefined,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      video: {
        public_id: videoResult.public_id,
        url: videoResult.secure_url,
        duration: videoResult.duration || 0,
        format: videoResult.format || 'mp4',
      },
      thumbnail: thumbnailResult
        ? { public_id: thumbnailResult.public_id, url: thumbnailResult.secure_url }
        : {},
      visibility: visibility || 'public',
      requiredPlan: requiredPlan || 'free',
      language: language || 'English',
      status: 'published',
    });

    if (category) {
      await Category.findByIdAndUpdate(category, { $inc: { videoCount: 1 } });
    }

    const populated = await Video.findById(video._id)
      .populate('creator', 'username avatar')
      .populate('category', 'name slug');

    res.status(201).json({ success: true, video: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update video
const updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

    if (req.user.role !== 'admin' && video.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, description, category, tags, visibility, requiredPlan, status, isTrending, isFeatured } = req.body;

    if (title) video.title = title;
    if (description !== undefined) video.description = description;
    if (category) video.category = category;
    if (tags) video.tags = tags.split(',').map(t => t.trim());
    if (visibility) video.visibility = visibility;
    if (requiredPlan) video.requiredPlan = requiredPlan;
    if (status) video.status = status;
    if (isTrending !== undefined) video.isTrending = isTrending === 'true';
    if (isFeatured !== undefined) video.isFeatured = isFeatured === 'true';

    if (req.file) {
      if (video.thumbnail.public_id) await deleteFromCloudinary(video.thumbnail.public_id);
      const result = await uploadImage(req.file.buffer, 'streamsphere/thumbnails');
      video.thumbnail = { public_id: result.public_id, url: result.secure_url };
    }

    await video.save();
    const updated = await Video.findById(video._id).populate('creator', 'username avatar').populate('category', 'name slug');
    res.json({ success: true, video: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete video
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

    if (req.user.role !== 'admin' && video.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (video.video.public_id) await deleteFromCloudinary(video.video.public_id, 'video');
    if (video.thumbnail.public_id) await deleteFromCloudinary(video.thumbnail.public_id);
    if (video.category) await Category.findByIdAndUpdate(video.category, { $inc: { videoCount: -1 } });

    await Video.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle like/dislike
const toggleLike = async (req, res) => {
  try {
    const { action } = req.body; // 'like' or 'dislike'
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

    const userId = req.user._id;

    if (action === 'like') {
      if (video.likes.includes(userId)) {
        video.likes.pull(userId);
      } else {
        video.likes.push(userId);
        video.dislikes.pull(userId);
      }
    } else if (action === 'dislike') {
      if (video.dislikes.includes(userId)) {
        video.dislikes.pull(userId);
      } else {
        video.dislikes.push(userId);
        video.likes.pull(userId);
      }
    }

    await video.save();
    res.json({ success: true, likes: video.likes.length, dislikes: video.dislikes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get creator videos
const getCreatorVideos = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = { creator: req.user._id };
    if (status) query.status = status;

    const total = await Video.countDocuments(query);
    const videos = await Video.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, videos, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update video progress
const updateProgress = async (req, res) => {
  try {
    const { progress, watchedDuration } = req.body;
    await WatchHistory.findOneAndUpdate(
      { user: req.user._id, video: req.params.id },
      { progress, watchedDuration, completed: progress >= 90, watchedAt: Date.now() },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get watch history
const getWatchHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await WatchHistory.countDocuments({ user: req.user._id });
    const history = await WatchHistory.find({ user: req.user._id })
      .populate({ path: 'video', populate: { path: 'creator', select: 'username avatar' } })
      .sort({ watchedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, history, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get continue watching
const getContinueWatching = async (req, res) => {
  try {
    const history = await WatchHistory.find({
      user: req.user._id,
      completed: false,
      progress: { $gt: 0 },
    })
      .populate({ path: 'video', populate: { path: 'creator', select: 'username avatar' } })
      .sort({ watchedAt: -1 })
      .limit(10);

    res.json({ success: true, videos: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: get all videos
const adminGetAllVideos = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const total = await Video.countDocuments(query);
    const videos = await Video.find(query)
      .populate('creator', 'username email')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, videos, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getVideos,
  getVideo,
  uploadVideoContent,
  updateVideo,
  deleteVideo,
  toggleLike,
  getCreatorVideos,
  updateProgress,
  getWatchHistory,
  getContinueWatching,
  adminGetAllVideos,
};
