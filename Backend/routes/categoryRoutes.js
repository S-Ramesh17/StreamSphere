const express = require('express');
const router = express.Router();
const { getCategories, getAllCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', getCategories);
router.get('/all', protect, authorize('admin'), getAllCategories);
router.post('/', protect, authorize('admin'), upload.single('thumbnail'), createCategory);
router.put('/:id', protect, authorize('admin'), upload.single('thumbnail'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
