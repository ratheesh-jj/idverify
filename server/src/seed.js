/**
 * Seed Script - Creates mock users for all 3 roles
 * Run: node src/seed.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('./models/User');
const config = require('./config');

const mockUsers = [
  {
    name: 'Admin User',
    email: 'admin@idverify.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'Checker User',
    email: 'checker@idverify.com',
    password: 'checker123',
    role: 'checker',
  },
  {
    name: 'Maker User',
    email: 'maker@idverify.com',
    password: 'maker123',
    role: 'maker',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB\n');

    for (const userData of mockUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`⚠  User already exists: ${userData.email} (${userData.role})`);
      } else {
        await User.create(userData);
        console.log(`✔  Created: ${userData.email} | Password: ${userData.password} | Role: ${userData.role}`);
      }
    }

    console.log('\n========================================');
    console.log('  Mock Login Credentials');
    console.log('========================================');
    console.log('');
    console.log('  ADMIN');
    console.log('  Email:    admin@idverify.com');
    console.log('  Password: admin123');
    console.log('');
    console.log('  CHECKER');
    console.log('  Email:    checker@idverify.com');
    console.log('  Password: checker123');
    console.log('');
    console.log('  MAKER');
    console.log('  Email:    maker@idverify.com');
    console.log('  Password: maker123');
    console.log('');
    console.log('========================================');

    await mongoose.disconnect();
    console.log('\nDone. MongoDB disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
