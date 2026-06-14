require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Url = require('../models/Url');
const Click = require('../models/Click');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/linksnip';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // 1. Clear existing data
    await Promise.all([
      User.deleteMany({ email: 'demo@linksnip.test' }),
      Url.deleteMany({}),
      Click.deleteMany({}),
    ]);
    console.log('Cleared existing demo data.');

    // 2. Create Demo User
    const user = await User.create({
      name: 'Demo User',
      email: 'demo@linksnip.test',
      password: 'password123',
    });
    console.log('Created demo user: demo@linksnip.test / password123');

    // 3. Create Sample URLs
    const urls = [
      {
        userId: user._id,
        originalUrl: 'https://google.com',
        shortCode: 'google',
        customAlias: 'search',
        clicks: 1240,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user._id,
        originalUrl: 'https://github.com/projectk',
        shortCode: 'github',
        customAlias: 'code',
        clicks: 856,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user._id,
        originalUrl: 'https://twitter.com/linksnip',
        shortCode: 'twitter',
        clicks: 432,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      }
    ];

    const createdUrls = await Url.insertMany(urls);
    console.log(`Created ${createdUrls.length} demo URLs.`);

    // 4. Create Click Records (thousands)
    const devices = ['mobile', 'desktop', 'tablet'];
    const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
    
    for (const url of createdUrls) {
      const clickCount = url.clicks;
      const clicks = [];
      
      for (let i = 0; i < clickCount; i++) {
        // Random time in the last 30 days
        const randomDaysAgo = Math.floor(Math.random() * 30);
        const timestamp = new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000);
        
        clicks.push({
          urlId: url._id,
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          device: devices[Math.floor(Math.random() * devices.length)],
          browser: browsers[Math.floor(Math.random() * browsers.length)],
          userAgent: 'Mozilla/5.0 Demo Bot',
          timestamp,
        });
      }
      
      await Click.insertMany(clicks);
      console.log(`Seeded ${clickCount} clicks for /${url.customAlias || url.shortCode}`);
    }

    console.log('\n✅ Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
