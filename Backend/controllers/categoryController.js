const Category = require('../models/Category');
const { uploadImage, deleteFromCloudinary } = require('../middleware/upload');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('createdBy', 'username').sort({ createdAt: -1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    let thumbnail = {};

    if (req.file) {
      const result = await uploadImage(req.file.buffer, 'streamsphere/categories');
      thumbnail = { public_id: result.public_id, url: result.secure_url };
    }

    const category = await Category.create({
      name,
      description,
      color,
      thumbnail,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const { name, description, color, isActive } = req.body;
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (color) category.color = color;
    if (isActive !== undefined) category.isActive = isActive === 'true';

    if (req.file) {
      if (category.thumbnail.public_id) await deleteFromCloudinary(category.thumbnail.public_id);
      const result = await uploadImage(req.file.buffer, 'streamsphere/categories');
      category.thumbnail = { public_id: result.public_id, url: result.secure_url };
    }

    await category.save();
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    if (category.thumbnail.public_id) await deleteFromCloudinary(category.thumbnail.public_id);
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCategories, getAllCategories, createCategory, updateCategory, deleteCategory };
