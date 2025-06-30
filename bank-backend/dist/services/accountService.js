"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccountBalance = exports.getAccountSummary = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const AccountSummary_1 = __importDefault(require("../models/AccountSummary"));
const BankTransaction_1 = __importDefault(require("../models/BankTransaction"));
const getAccountSummary = async (userId, accountNumber) => {
    // Get or create summary
    let summary = await AccountSummary_1.default.findOne({ userId, accountNumber });
    if (!summary) {
        summary = await AccountSummary_1.default.create({
            userId,
            accountNumber,
            currentBalance: 0,
            availableBalance: 0,
            currency: 'USD'
        });
    }
    // Calculate monthly stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyTransactions = await BankTransaction_1.default.aggregate([
        {
            $match: {
                userId: new mongoose_1.default.Types.ObjectId(userId),
                accountNumber,
                createdAt: { $gte: startOfMonth }
            }
        },
        {
            $group: {
                _id: null,
                totalDeposits: {
                    $sum: {
                        $cond: [{ $eq: ['$type', 'deposit'] }, '$amount', 0]
                    }
                },
                totalWithdrawals: {
                    $sum: {
                        $cond: [{ $in: ['$type', ['withdrawal', 'payment']] }, '$amount', 0]
                    }
                }
            }
        }
    ]);
    // Update summary if transactions exist
    if (monthlyTransactions.length > 0) {
        const stats = monthlyTransactions[0];
        summary.monthlyStats = {
            totalDeposits: stats.totalDeposits,
            totalWithdrawals: stats.totalWithdrawals,
            netChange: stats.totalDeposits - stats.totalWithdrawals
        };
        await summary.save();
    }
    return summary;
};
exports.getAccountSummary = getAccountSummary;
const updateAccountBalance = async (userId, accountNumber, amount, transactionType) => {
    const update = {
        $inc: {
            currentBalance: amount,
            availableBalance: amount,
            ...(transactionType === 'deposit' && {
                'monthlyStats.totalDeposits': amount
            }),
            ...((transactionType === 'withdrawal' || transactionType === 'payment') && {
                'monthlyStats.totalWithdrawals': amount
            })
        },
        $set: {
            lastTransactionDate: new Date()
        }
    };
    await AccountSummary_1.default.findOneAndUpdate({ userId, accountNumber }, update, { new: true, upsert: true });
};
exports.updateAccountBalance = updateAccountBalance;
