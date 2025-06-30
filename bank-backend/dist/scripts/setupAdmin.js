"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// bank-backend/src/scripts/setupAdmin.ts
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
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
            // Update existing user to be admin
            existingAdmin.isAdmin = true;
            await existingAdmin.save();
            console.log(`Updated existing user ${adminEmail} to admin`);
        }
        else {
            // Create new admin user
            const hashedPassword = await bcryptjs_1.default.hash(adminPassword, 10);
            const adminUser = new User_1.default({
                firstName: 'Admin',
                lastName: 'User',
                email: adminEmail,
                password: hashedPassword,
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
    }
    catch (error) {
        console.error('Error setting up admin:', error);
        process.exit(1);
    }
};
setupAdmin();
