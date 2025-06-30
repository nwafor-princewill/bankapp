"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middleware/auth"));
// **FIX 1:** Import the 'TransactionType' enum.
const BankTransaction_1 = __importStar(require("../models/BankTransaction"));
const AccountSummary_1 = __importDefault(require("../models/AccountSummary"));
const accountService_1 = require("../services/accountService");
const router = (0, express_1.Router)();
// Get available billers
router.get('/billers', auth_1.default, async (req, res) => {
    try {
        // In a real app, this would come from a database
        const billers = [
            { id: 'elec-1', name: 'Electric Company', category: 'Utilities', accountNumber: 'ELEC12345' },
            { id: 'water-1', name: 'Water Works', category: 'Utilities', accountNumber: 'WATER67890' },
            { id: 'internet-1', name: 'Internet Provider', category: 'Services', accountNumber: 'NET45678' }
        ];
        res.json(billers);
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch billers'
        });
    }
});
// Process bill payment
router.post('/', auth_1.default, async (req, res) => {
    try {
        const { fromAccount, billerId, amount, paymentDate, reference } = req.body;
        // Validation
        if (!fromAccount || !billerId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }
        // Check account balance
        const account = await AccountSummary_1.default.findOne({
            accountNumber: fromAccount,
            userId: req.user?.id
        });
        if (!account || account.availableBalance < numericAmount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient funds'
            });
        }
        // Create transaction record
        const transaction = await BankTransaction_1.default.create({
            userId: req.user?.id,
            accountNumber: fromAccount,
            amount: -numericAmount,
            // **FIX 2:** Use the enum member 'TransactionType.PAYMENT'.
            type: BankTransaction_1.TransactionType.PAYMENT,
            description: `Bill payment to ${billerId}`,
            balanceAfter: account.currentBalance - numericAmount,
            reference,
            status: 'completed'
        });
        // Update account balance
        await (0, accountService_1.updateAccountBalance)(req.user?.id, fromAccount, -numericAmount, 
        // **FIX 3:** Use the enum member here as well.
        BankTransaction_1.TransactionType.PAYMENT);
        res.json({
            success: true,
            message: 'Payment processed',
            transaction
        });
    }
    catch (err) {
        console.error('Bill payment error:', err);
        res.status(500).json({
            success: false,
            message: 'Payment failed'
        });
    }
});
exports.default = router;
