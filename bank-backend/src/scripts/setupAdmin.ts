// bank-backend/src/scripts/setupAdmin.ts
import mongoose from 'mongoose';
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
      // Delete the existing admin to recreate with proper password hashing
      await User.deleteOne({ email: adminEmail });
      console.log(`Deleted existing user ${adminEmail} to fix password hashing`);
    }

    // Create new admin user with all required fields
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      password: adminPassword, // Raw password - model will hash it
      gender: 'prefer-not-to-say',
      dateOfBirth: new Date('1990-01-01'), // Default admin birth date
      country: 'System',
      state: 'System',
      address: 'System Admin Address',
      phone: '+1234567890',
      securityQuestions: [
        {
          question: "What is your system role?",
          answer: "Administrator"
        }
      ],
      isAdmin: true,
      accounts: [] // No bank accounts for admin
    });

    await adminUser.save();
    console.log(`Created admin user: ${adminEmail}`);
    console.log('Admin setup completed successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
};

setupAdmin();