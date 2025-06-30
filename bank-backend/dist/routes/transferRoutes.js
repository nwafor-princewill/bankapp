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
const BankTransaction_1 = __importStar(require("../models/BankTransaction"));
const AccountSummary_1 = __importDefault(require("../models/AccountSummary"));
const accountService_1 = require("../services/accountService");
const router = (0, express_1.Router)();
router.post('/', auth_1.default, async (req, res) => {
    try {
        const { fromAccount, toAccount, amount, description } = req.body;
        // Validation
        if (!fromAccount || !toAccount || !amount) {
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
        // Check if sender has sufficient balance
        const senderAccount = await AccountSummary_1.default.findOne({
            accountNumber: fromAccount,
            userId: req.user?.id
        });
        if (!senderAccount || senderAccount.availableBalance < numericAmount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient funds'
            });
        }
        // Create transaction records
        const reference = `TRX-${Date.now()}`;
        // Outbound transaction (from sender)
        const outboundTx = await BankTransaction_1.default.create({
            userId: req.user?.id,
            accountNumber: fromAccount,
            amount: -numericAmount,
            // **FIXED:** Use the enum member
            type: BankTransaction_1.TransactionType.TRANSFER,
            //   type: 'transfer',
            description,
            recipientAccount: toAccount,
            balanceAfter: senderAccount.currentBalance - numericAmount,
            reference,
            status: 'completed'
        });
        // Update sender's balance
        await (0, accountService_1.updateAccountBalance)(req.user?.id, fromAccount, -numericAmount, 
        // **FIXED:** Use the enum member here as well
        BankTransaction_1.TransactionType.TRANSFER
        //   'transfer'
        );
        // Inbound transaction (to recipient)
        const inboundTx = await BankTransaction_1.default.create({
            userId: req.user?.id,
            accountNumber: toAccount,
            amount: numericAmount,
            // **FIXED:** Use the enum member for deposit
            type: BankTransaction_1.TransactionType.DEPOSIT,
            //   type: 'deposit',
            description: `Transfer from ${fromAccount}`,
            balanceAfter: 0,
            reference,
            status: 'completed'
        });
        // Update recipient's balance (in real app)
        // await updateAccountBalance(recipientUserId, toAccount, numericAmount, 'deposit');
        res.json({
            success: true,
            message: 'Transfer successful',
            transaction: outboundTx
        });
    }
    catch (err) {
        console.error('Transfer error:', err);
        res.status(500).json({
            success: false,
            message: 'Transfer failed'
        });
    }
});
exports.default = router;
