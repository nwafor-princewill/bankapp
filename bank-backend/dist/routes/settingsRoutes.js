"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middleware/auth"));
const User_1 = __importDefault(require("../models/User"));
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// Get user profile
router.get('/profile', auth_1.default, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.id).select('-password');
        res.json(user);
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
});
// Add to existing settingsRoutes.ts
router.get('/notifications', auth_1.default, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.id)
            .select('email notificationPreferences');
        res.json({
            email: user?.email,
            preferences: user?.notificationPreferences || {
                accountActivity: true,
                promotions: false,
                securityAlerts: true
            }
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch settings'
        });
    }
});
router.put('/notifications', auth_1.default, async (req, res) => {
    try {
        const user = await User_1.default.findByIdAndUpdate(req.user?.id, { notificationPreferences: req.body.preferences }, { new: true }).select('notificationPreferences');
        res.json({
            success: true,
            preferences: user?.notificationPreferences
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Update failed'
        });
    }
});
// Update profile
router.put('/profile', auth_1.default, [
    (0, express_validator_1.check)('firstName', 'First name is required').not().isEmpty(),
    (0, express_validator_1.check)('lastName', 'Last name is required').not().isEmpty(),
    (0, express_validator_1.check)('email', 'Please include a valid email').isEmail()
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await User_1.default.findByIdAndUpdate(req.user?.id, {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email
        }, { new: true }).select('-password');
        res.json({
            success: true,
            user
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Update failed'
        });
    }
});
// Update password
router.post('/security/password', auth_1.default, [
    (0, express_validator_1.check)('currentPassword', 'Current password is required').notEmpty(),
    (0, express_validator_1.check)('newPassword', 'Password must be 6+ characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await User_1.default.findById(req.user?.id);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const isMatch = await user.matchPassword(req.body.currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        user.password = req.body.newPassword;
        await user.save();
        res.json({ success: true, message: 'Password updated successfully' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
// Update security question
router.post('/security/question', auth_1.default, [
    (0, express_validator_1.check)('question', 'Question is required').notEmpty(),
    (0, express_validator_1.check)('answer', 'Answer is required').notEmpty()
], async (req, res) => {
    // Similar validation and update logic
});
exports.default = router;
