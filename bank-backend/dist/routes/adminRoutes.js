"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// bank-backend/src/routes/adminRoutes.ts
const express_1 = require("express");
const auth_1 = __importDefault(require("../middleware/auth"));
const isAdmin_1 = require("../middleware/isAdmin");
const User_1 = __importDefault(require("../models/User"));
const AccountSummary_1 = __importDefault(require("../models/AccountSummary"));
const router = (0, express_1.Router)();
// Create a simple config model for storing BTC address
const mongoose_1 = __importDefault(require("mongoose"));
const configSchema = new mongoose_1.default.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now }
});
const Config = mongoose_1.default.model('Config', configSchema);
// Helper function to get BTC address
const getBtcAddress = async () => {
    try {
        const config = await Config.findOne({ key: 'BTC_ADDRESS' });
        return config?.value || process.env.BTC_ADDRESS || 'bc1quu924ms2860tv59es2sqmdwkdj6me3tvrf5nmq';
    }
    catch (err) {
        return process.env.BTC_ADDRESS || 'bc1quu924ms2860tv59es2sqmdwkdj6me3tvrf5nmq';
    }
};
// Admin stats
router.get('/stats', auth_1.default, isAdmin_1.isAdmin, async (req, res) => {
    try {
        console.log('Admin stats route hit');
        const users = await User_1.default.countDocuments();
        const activeUsers = await User_1.default.countDocuments();
        const totalBalance = await AccountSummary_1.default.aggregate([
            { $group: { _id: null, total: { $sum: '$currentBalance' } } }
        ]);
        const btcAddress = await getBtcAddress();
        const response = {
            users,
            activeUsers,
            totalBalance: totalBalance[0]?.total || 0,
            btcAddress
        };
        console.log('Sending admin stats:', response);
        res.json(response);
    }
    catch (err) {
        console.error('Admin stats error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// Get all users
router.get('/users', auth_1.default, isAdmin_1.isAdmin, async (req, res) => {
    try {
        console.log('Admin users route hit');
        const users = await User_1.default.find().select('-password');
        console.log('Found users:', users.length);
        res.json(users);
    }
    catch (err) {
        console.error('Admin users error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// Credit user account - FIXED VERSION
router.post('/credit', auth_1.default, isAdmin_1.isAdmin, async (req, res) => {
    try {
        console.log('Admin credit route hit with body:', req.body);
        const { userEmail, accountNumber, amount, description } = req.body;
        if (!userEmail || !accountNumber || !amount) {
            return res.status(400).json({ message: 'Missing required fields: userEmail, accountNumber, amount' });
        }
        // Find user by email
        const user = await User_1.default.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if user has this account
        const userAccount = user.accounts.find(acc => acc.accountNumber === accountNumber);
        if (!userAccount) {
            return res.status(404).json({ message: 'Account not found for this user' });
        }
        // Update the user's account balance directly
        await User_1.default.updateOne({ _id: user._id, 'accounts.accountNumber': accountNumber }, {
            $inc: { 'accounts.$.balance': Number(amount) },
            $set: { 'accounts.$.updatedAt': new Date() }
        });
        // Also update AccountSummary if it exists
        try {
            await AccountSummary_1.default.findOneAndUpdate({ userId: user._id, accountNumber: accountNumber }, {
                $inc: { currentBalance: Number(amount) },
                $set: { lastUpdated: new Date() }
            });
        }
        catch (summaryErr) {
            console.log('AccountSummary update failed (might not exist):', summaryErr);
        }
        console.log(`Successfully credited $${amount} to ${userEmail}'s account ${accountNumber}`);
        res.json({
            success: true,
            message: `Successfully credited $${amount} to ${userEmail}'s account ${accountNumber}`
        });
    }
    catch (err) {
        console.error('Admin credit error:', err);
        res.status(500).json({ message: 'Server error: ' + (err instanceof Error ? err.message : String(err)) });
    }
});
// Update BTC address - DEPLOYMENT READY
router.post('/update-btc', auth_1.default, isAdmin_1.isAdmin, async (req, res) => {
    try {
        const { newAddress } = req.body;
        if (!newAddress) {
            return res.status(400).json({ message: 'BTC address is required' });
        }
        // Save to database for deployment
        await Config.findOneAndUpdate({ key: 'BTC_ADDRESS' }, {
            key: 'BTC_ADDRESS',
            value: newAddress,
            updatedAt: new Date()
        }, { upsert: true, new: true });
        console.log('BTC address updated to:', newAddress);
        res.json({ success: true, message: 'BTC address updated successfully' });
    }
    catch (err) {
        console.error('Admin BTC update error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
