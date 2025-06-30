"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionType = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
var TransactionType;
(function (TransactionType) {
    TransactionType["DEPOSIT"] = "deposit";
    TransactionType["WITHDRAWAL"] = "withdrawal";
    TransactionType["TRANSFER"] = "transfer";
    TransactionType["PAYMENT"] = "payment";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
const BankTransactionSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    accountNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    type: {
        type: String,
        enum: Object.values(TransactionType),
        required: true
    },
    description: { type: String, required: true },
    balanceAfter: { type: Number, required: true },
    recipientAccount: { type: String },
    reference: { type: String, required: true, unique: true },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Indexes for faster queries
BankTransactionSchema.index({ userId: 1, createdAt: -1 });
BankTransactionSchema.index({ accountNumber: 1 });
exports.default = mongoose_1.default.model('BankTransaction', BankTransactionSchema);
