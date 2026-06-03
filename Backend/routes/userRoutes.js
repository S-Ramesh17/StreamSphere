const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUserRole, toggleUserStatus, deleteUser, toggleFollow, getTopCreators } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/creators/top', getTopCreators);
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, getUserById);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);
router.put('/:id/toggle-status', protect, authorize('admin'), toggleUserStatus);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.post('/:id/follow', protect, toggleFollow);

module.exports = router;
