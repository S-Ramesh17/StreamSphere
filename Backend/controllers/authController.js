const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email or username already exists' });
    }

    const allowedRoles = ['creator', 'subscriber'];
    const userRole = allowedRoles.includes(role) ? role : 'subscriber';

    const user = await User.create({ username, email, password, role: userRole });

    // Create free subscription
    await Subscription.create({ user: user._id, plan: 'free', status: 'active' });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    const subscription = await Subscription.findOne({ user: user._id });

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
        subscription: subscription ? { plan: subscription.plan, status: subscription.status } : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const subscription = await Subscription.findOne({ user: req.user._id });

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        subscription: subscription ? { plan: subscription.plan, status: subscription.status } : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { username, bio, socialLinks } = req.body;
    const { uploadImage, deleteFromCloudinary } = require('../middleware/upload');

    const user = await User.findById(req.user._id);

    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) return res.status(400).json({ success: false, message: 'Username already taken' });
      user.username = username;
    }

    if (bio !== undefined) user.bio = bio;
    if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };

    if (req.file) {
      if (user.avatar.public_id) {
        await deleteFromCloudinary(user.avatar.public_id);
      }
      const result = await uploadImage(req.file.buffer, 'streamsphere/avatars');
      user.avatar = { public_id: result.public_id, url: result.secure_url };
    }

    await user.save({ validateBeforeSave: false });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
