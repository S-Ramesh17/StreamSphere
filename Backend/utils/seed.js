const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Category = require('../models/Category');
const Subscription = require('../models/Subscription');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Create admin
    const existingAdmin = await User.findOne({ email: 'admin@streamsphere.com' });
    if (!existingAdmin) {
      const admin = await User.create({
        username: 'admin',
        email: 'admin@streamsphere.com',
        password: 'Admin@123',
        role: 'admin',
        isVerified: true,
        bio: 'StreamSphere Platform Administrator',
      });
      await Subscription.create({ user: admin._id, plan: 'family', status: 'active', price: 0 });
      console.log('Admin created: admin@streamsphere.com / Admin@123');
    }

    // Create sample creator
    const existingCreator = await User.findOne({ email: 'creator@streamsphere.com' });
    if (!existingCreator) {
      const creator = await User.create({
        username: 'samplecreator',
        email: 'creator@streamsphere.com',
        password: 'Creator@123',
        role: 'creator',
        isVerified: true,
        bio: 'Sample content creator on StreamSphere',
      });
      await Subscription.create({ user: creator._id, plan: 'premium', status: 'active' });
      console.log('Creator created: creator@streamsphere.com / Creator@123');
    }

    // Create default categories
    const categories = [
      { name: 'Action', description: 'Action and adventure content', color: '#e50914' },
      { name: 'Drama', description: 'Dramatic storytelling', color: '#0071eb' },
      { name: 'Comedy', description: 'Laugh out loud content', color: '#f5a623' },
      { name: 'Documentary', description: 'Real world stories', color: '#4a90d9' },
      { name: 'Sci-Fi', description: 'Science fiction and futurism', color: '#7b68ee' },
      { name: 'Horror', description: 'Thrilling and scary content', color: '#8b0000' },
      { name: 'Romance', description: 'Love and relationship stories', color: '#ff69b4' },
      { name: 'Gaming', description: 'Gaming streams and reviews', color: '#00b300' },
      { name: 'Music', description: 'Music videos and performances', color: '#ff8c00' },
      { name: 'Sports', description: 'Sports highlights and streams', color: '#1da1f2' },
    ];

    for (const cat of categories) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) await Category.create(cat);
    }
    console.log('Categories created');

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
