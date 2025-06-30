"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const accountSchema = new mongoose_1.default.Schema({
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true },
    balance: { type: Number, default: 0.00 },
    currency: { type: String, default: 'USD' },
    openedAt: { type: Date, default: Date.now }
});
const cryptoWalletSchema = new mongoose_1.default.Schema({
    walletAddress: { type: String, required: true },
    currency: { type: String, required: true },
    balance: { type: Number, default: 0 },
    label: { type: String },
    isBankManaged: { type: Boolean, default: false }
});
const cardSchema = new mongoose_1.default.Schema({
    cardId: { type: String, required: true },
    lastFour: { type: String, required: true },
    cardType: { type: String, enum: ['VISA', 'MASTERCARD'], required: true },
    expiry: { type: String, required: true },
    status: {
        type: String,
        enum: ['active', 'locked', 'lost'],
        default: 'active'
    }
});
// **FIX 3:** Define the schema for the notification preferences
const notificationPreferencesSchema = new mongoose_1.default.Schema({
    accountActivity: { type: Boolean, default: true },
    promotions: { type: Boolean, default: false },
    securityAlerts: { type: Boolean, default: true }
}, { _id: false }); // Use _id: false as it's a subdocument
const userSchema = new mongoose_1.default.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    accounts: [accountSchema],
    cryptoWallets: [cryptoWalletSchema],
    cards: [cardSchema],
    rewardPoints: { type: Number, default: 1000, min: 0 },
    isAdmin: { type: Boolean, required: true, default: false },
    notificationPreferences: { type: notificationPreferencesSchema, default: () => ({}) }
}, {
    timestamps: true
});
// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
});
// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcryptjs_1.default.compare(enteredPassword, this.password);
};
exports.default = mongoose_1.default.model('User', userSchema);
