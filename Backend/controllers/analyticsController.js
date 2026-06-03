const User = require('../models/User');
const Video = require('../models/Video');
const LiveStream = require('../models/LiveStream');
const Subscription = require('../models/Subscription');
const WatchHistory = require('../models/WatchHistory');

const getAdminAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCreators,
      totalVideos,
      totalStreams,
      subscriptionStats,
      topVideos,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'creator', isActive: true }),
      Video.countDocuments({ status: 'published' }),
      LiveStream.countDocuments(),
      Subscription.aggregate([
        { $group: { _id: '$plan', count: { $sum: 1 }, revenue: { $sum: '$price' } } },
      ]),
      Video.find({ status: 'published' })
        .populate('creator', 'username')
        .sort({ views: -1 })
        .limit(10),
      User.find().sort({ createdAt: -1 }).limit(5).select('username email role createdAt avatar'),
    ]);

    const totalSubscribers = subscriptionStats
      .filter(s => s._id !== 'free')
      .reduce((acc, s) => acc + s.count, 0);

    const totalRevenue = subscriptionStats
      .filter(s => s._id !== 'free')
      .reduce((acc, s) => acc + s.revenue, 0);

    // User growth (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top creators by video count
    const topCreators = await Video.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$creator', videoCount: { $sum: 1 }, totalViews: { $sum: '$views' } } },
      { $sort: { totalViews: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'creator' } },
      { $unwind: '$creator' },
      { $project: { 'creator.username': 1, 'creator.avatar': 1, videoCount: 1, totalViews: 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCreators,
        totalSubscribers,
        totalVideos,
        totalStreams,
        totalRevenue: totalRevenue.toFixed(2),
      },
      subscriptionBreakdown: subscriptionStats,
      topVideos,
      topCreators,
      recentUsers,
      userGrowth,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCreatorAnalytics = async (req, res) => {
  try {
    const creatorId = req.user._id;

    const [totalVideos, totalStreams, videoStats] = await Promise.all([
      Video.countDocuments({ creator: creatorId }),
      LiveStream.countDocuments({ creator: creatorId }),
      Video.aggregate([
        { $match: { creator: creatorId } },
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$views' },
            totalLikes: { $sum: { $size: '$likes' } },
          },
        },
      ]),
    ]);

    const topVideos = await Video.find({ creator: creatorId, status: 'published' })
      .sort({ views: -1 })
      .limit(5);

    const recentActivity = await WatchHistory.aggregate([
      {
        $lookup: {
          from: 'videos',
          localField: 'video',
          foreignField: '_id',
          as: 'videoData',
        },
      },
      { $unwind: '$videoData' },
      { $match: { 'videoData.creator': creatorId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$watchedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 14 },
    ]);

    const creator = await User.findById(creatorId).select('followers following');

    res.json({
      success: true,
      stats: {
        totalVideos,
        totalStreams,
        totalViews: videoStats[0]?.totalViews || 0,
        totalLikes: videoStats[0]?.totalLikes || 0,
        followers: creator.followers.length,
      },
      topVideos,
      recentActivity: recentActivity.reverse(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAdminAnalytics, getCreatorAnalytics };
