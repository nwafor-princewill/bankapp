"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const accountUtils_1 = require("../utils/accountUtils");
const router = (0, express_1.Router)();
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        // Add validation
        if (!req.body.email || !req.body.password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        let user = await User_1.default.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const accountNumber = (0, accountUtils_1.generateAccountNumber)();
        const accountName = (0, accountUtils_1.generateAccountName)(firstName, lastName);
        user = new User_1.default({
            firstName,
            lastName,
            email,
            password,
            accounts: [{
                    accountNumber,
                    accountName,
                    balance: 0.00,
                    currency: 'USD',
                }]
        });
        await user.save();
        // Verify JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET not configured');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(201).json({
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                accounts: user.accounts
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Debug logging
        console.log('Stored hash:', user.password);
        console.log('Input password:', req.body.password);
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                accounts: user.accounts
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
// Add to your authRoutes.ts
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await User_1.default.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    }
    catch (err) {
        res.status(500).send('Server error');
    }
});
exports.default = router;
