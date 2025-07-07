"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// bank-backend/src/scripts/setupAdmin.ts
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const setupAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) {
            console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables');
            process.exit(1);
        }
        // Check if admin already exists
        const existingAdmin = await User_1.default.findOne({ email: adminEmail });
        if (existingAdmin) {
            // Delete the existing admin to recreate with proper password hashing
            await User_1.default.deleteOne({ email: adminEmail });
            console.log(`Deleted existing user ${adminEmail} to fix password hashing`);
        }
        // Create new admin user - let the model's pre-save middleware handle password hashing
        const adminUser = new User_1.default({
            firstName: 'Admin',
            lastName: 'User',
            email: adminEmail,
            password: adminPassword,
            isAdmin: true,
            accounts: [] // No bank accounts for admin
        });
        await adminUser.save();
        console.log(`Created admin user: ${adminEmail}`);
        console.log('Admin setup completed successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('Error setting up admin:', error);
        process.exit(1);
    }
};
setupAdmin();
