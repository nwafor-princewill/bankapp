"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const AccountSummarySchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true // Keep index definition here (remove the explicit index call below)
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true,
        index: true // Keep index definition here (remove the explicit index call below)
    },
    currentBalance: { type: Number, required: true, default: 0 },
    availableBalance: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'USD' },
    lastTransactionDate: { type: Date },
    monthlyStats: {
        totalDeposits: { type: Number, default: 0 },
        totalWithdrawals: { type: Number, default: 0 },
        netChange: { type: Number, default: 0 }
    }
}, { timestamps: true });
// Remove these explicit index calls since we're using the schema option above
// AccountSummarySchema.index({ userId: 1 });
// AccountSummarySchema.index({ accountNumber: 1 });
exports.default = mongoose_1.default.model('AccountSummary', AccountSummarySchema);
