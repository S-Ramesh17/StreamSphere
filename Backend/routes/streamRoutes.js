const express = require('express');
const router = express.Router();
const { getStreams, getStream, createStream, updateStream, startStream, endStream, deleteStream, getCreatorStreams } = require('../controllers/streamController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', getStreams);
router.get('/creator/my', protect, authorize('creator', 'admin'), getCreatorStreams);
router.get('/:id', getStream);
router.post('/', protect, authorize('creator', 'admin'), upload.single('thumbnail'), createStream);
router.put('/:id', protect, authorize('creator', 'admin'), upload.single('thumbnail'), updateStream);
router.put('/:id/start', protect, authorize('creator', 'admin'), startStream);
router.put('/:id/end', protect, authorize('creator', 'admin'), endStream);
router.delete('/:id', protect, authorize('creator', 'admin'), deleteStream);

module.exports = router;
