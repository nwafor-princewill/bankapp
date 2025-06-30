"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountTransactions = exports.updateAccountAfterTransaction = exports.createTransaction = void 0;
const BankTransaction_1 = __importDefault(require("../models/BankTransaction"));
const accountService_1 = require("./accountService");
const createTransaction = async (userId, accountNumber, amount, type, description, balanceAfter, reference, recipientAccount) => {
    return BankTransaction_1.default.create({
        userId,
        accountNumber,
        amount,
        type,
        description,
        balanceAfter,
        recipientAccount,
        reference,
        status: 'completed'
    });
};
exports.createTransaction = createTransaction;
// ... after creating transaction
const updateAccountAfterTransaction = async (userId, accountNumber, amount, type) => {
    await (0, accountService_1.updateAccountBalance)(userId, accountNumber, amount, type);
};
exports.updateAccountAfterTransaction = updateAccountAfterTransaction;
const getAccountTransactions = async (userId, accountNumber, limit = 10) => {
    return BankTransaction_1.default.find({ userId, accountNumber })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
};
exports.getAccountTransactions = getAccountTransactions;
