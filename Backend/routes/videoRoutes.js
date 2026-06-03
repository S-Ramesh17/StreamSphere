const express = require('express');
const router = express.Router();
const {
  getVideos, getVideo, uploadVideoContent, updateVideo, deleteVideo,
  toggleLike, getCreatorVideos, updateProgress, getWatchHistory,
  getContinueWatching, adminGetAllVideos,
} = require('../controllers/videoController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', getVideos);
router.get('/admin/all', protect, authorize('admin'), adminGetAllVideos);
router.get('/creator/my', protect, authorize('creator', 'admin'), getCreatorVideos);
router.get('/history', protect, getWatchHistory);
router.get('/continue', protect, getContinueWatching);
router.get('/:id', optionalAuth, getVideo);

router.post('/', protect, authorize('creator', 'admin'),
  upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]),
  uploadVideoContent
);

router.put('/:id', protect, authorize('creator', 'admin'), upload.single('thumbnail'), updateVideo);
router.delete('/:id', protect, authorize('creator', 'admin'), deleteVideo);
router.post('/:id/like', protect, toggleLike);
router.put('/:id/progress', protect, updateProgress);

module.exports = router;
