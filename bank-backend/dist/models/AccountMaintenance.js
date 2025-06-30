"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const AccountMaintenanceSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    accountNumber: { type: String, required: true },
    requestType: { type: String, required: true },
    details: { type: String, required: true },
    status: {
        type: String,
        enum: ['submitted', 'in_progress', 'completed'],
        default: 'submitted'
    }
}, { timestamps: true });
exports.default = mongoose_1.default.model('AccountMaintenance', AccountMaintenanceSchema);
