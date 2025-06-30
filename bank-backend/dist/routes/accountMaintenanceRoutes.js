"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middleware/auth"));
const AccountMaintenance_1 = __importDefault(require("../models/AccountMaintenance")); // Ensure this model is defined correctly
const router = (0, express_1.Router)();
// Submit maintenance request
router.post('/', auth_1.default, async (req, res) => {
    try {
        const { accountNumber, requestType, details } = req.body;
        const request = new AccountMaintenance_1.default({
            userId: req.user?.id,
            accountNumber,
            requestType,
            details,
            status: 'submitted'
        });
        await request.save();
        res.status(201).json({
            success: true,
            request,
            message: 'Maintenance request submitted'
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Request failed'
        });
    }
});
exports.default = router;
