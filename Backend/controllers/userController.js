const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Video = require('../models/Video');

// @desc    Get all users (Admin)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, isActive } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      users,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const subscription = await Subscription.findOne({ user: user._id });
    const videoCount = await Video.countDocuments({ creator: user._id, status: 'published' });

    res.json({ success: true, user: { ...user.toObject(), subscription, videoCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role (Admin)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'creator', 'subscriber'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user active status (Admin)
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin user' });
    }
    await User.findByIdAndDelete(req.params.id);
    await Subscription.findOneAndDelete({ user: req.params.id });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Follow / Unfollow creator
const toggleFollow = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const currentUser = await User.findById(req.user._id);
    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      currentUser.following.pull(req.params.id);
      targetUser.followers.pull(req.user._id);
    } else {
      currentUser.following.push(req.params.id);
      targetUser.followers.push(req.user._id);
    }

    await currentUser.save({ validateBeforeSave: false });
    await targetUser.save({ validateBeforeSave: false });

    res.json({ success: true, following: !isFollowing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get top creators
const getTopCreators = async (req, res) => {
  try {
    const creators = await User.aggregate([
      { $match: { role: 'creator', isActive: true } },
      { $addFields: { followersCount: { $size: '$followers' } } },
      { $sort: { followersCount: -1 } },
      { $limit: 10 },
      { $project: { password: 0 } },
    ]);
    res.json({ success: true, creators });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllUsers, getUserById, updateUserRole, toggleUserStatus, deleteUser, toggleFollow, getTopCreators };
