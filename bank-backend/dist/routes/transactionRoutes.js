"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middleware/auth"));
const BankTransaction_1 = __importDefault(require("../models/BankTransaction"));
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
// Get transactions with pagination
router.get('/', auth_1.default, async (req, res) => {
    try {
        const { page = 1, limit = 10, type, startDate, endDate, accountNumber } = req.query;
        // Build query
        const query = {
            userId: new mongoose_1.default.Types.ObjectId(req.user?.id)
        };
        if (accountNumber) {
            query.accountNumber = accountNumber;
        }
        if (type) {
            query.type = type;
        }
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate)
                query.createdAt.$gte = new Date(startDate);
            if (endDate)
                query.createdAt.$lte = new Date(endDate);
        }
        // Get total count and paginated results
        const total = await BankTransaction_1.default.countDocuments(query);
        const transactions = await BankTransaction_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    total,
                    page: Number(page),
                    totalPages: Math.ceil(total / Number(limit)),
                    limit: Number(limit)
                }
            }
        });
    }
    catch (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
// Create a new transaction
router.post('/', auth_1.default, async (req, res) => {
    try {
        const { accountNumber, amount, type, description, balanceAfter, recipientAccount, reference } = req.body;
        const transaction = await BankTransaction_1.default.create({
            userId: req.user?.id,
            accountNumber,
            amount,
            type,
            description,
            balanceAfter,
            recipientAccount,
            reference,
            status: 'completed'
        });
        res.status(201).json({
            success: true,
            data: transaction
        });
    }
    catch (err) {
        console.error('Error creating transaction:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
exports.default = router;
