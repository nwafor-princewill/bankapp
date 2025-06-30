"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middleware/auth"));
const User_1 = __importDefault(require("../models/User"));
const router = (0, express_1.Router)();
// Get user's points balance
router.get('/balance', auth_1.default, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.id).select('rewardPoints');
        res.json({
            balance: user?.rewardPoints || 0
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch balance'
        });
    }
});
// Redeem points
router.post('/', auth_1.default, async (req, res) => {
    const { amount, reward } = req.body;
    try {
        const user = await User_1.default.findById(req.user?.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Simple validation
        if (user.rewardPoints < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient points'
            });
        }
        // Update balance
        user.rewardPoints -= amount;
        await user.save();
        // In production: Create redemption record here
        res.json({
            success: true,
            newBalance: user.rewardPoints,
            message: `Redeemed ${amount} points for ${reward}`
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Redemption failed'
        });
    }
});
exports.default = router;
