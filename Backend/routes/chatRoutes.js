const express = require('express');
const router = express.Router();
const { getRoomMessages, sendMessage, deleteMessage } = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/auth');

router.get('/:room/messages', protect, getRoomMessages);
router.post('/send', protect, sendMessage);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
