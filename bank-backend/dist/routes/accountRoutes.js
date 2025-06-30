"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middleware/auth"));
const accountService_1 = require("../services/accountService");
const router = (0, express_1.Router)();
// @route   GET /api/accounts/summary
router.get('/summary', auth_1.default, async (req, res) => {
    try {
        // Add validation
        if (!req.user?.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const accountNumber = req.query.accountNumber;
        if (!accountNumber) {
            return res.status(400).json({
                success: false,
                message: 'Account number required',
                data: null
            });
        }
        const summary = await (0, accountService_1.getAccountSummary)(req.user.id, accountNumber);
        res.json({
            success: true,
            message: 'Account summary retrieved',
            data: summary
        });
    }
    catch (err) {
        console.error('Account summary error:', err);
        res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === 'development'
                ? err instanceof Error ? err.message : 'Server error'
                : 'Server error',
            data: null
        });
    }
});
exports.default = router;
