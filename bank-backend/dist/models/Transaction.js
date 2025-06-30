"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const transactionSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    txid: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'BTC' },
    confirmations: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });
exports.default = mongoose_1.default.model('Transaction', transactionSchema);
