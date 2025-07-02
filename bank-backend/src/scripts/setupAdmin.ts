// bank-backend/src/scripts/setupAdmin.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const setupAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      // Update existing user to be admin
      existingAdmin.isAdmin = true;
      await existingAdmin.save();
      console.log(`Updated existing user ${adminEmail} to admin`);
    } else {
      // Create new admin user
      // const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: adminPassword,
        isAdmin: true,
        phoneNumber: '1234567890',
        dateOfBirth: new Date('1990-01-01'),
        address: 'Admin Address',
        accounts: []
      });

      await adminUser.save();
      console.log(`Created admin user: ${adminEmail}`);
    }

    console.log('Admin setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
};

setupAdmin();
