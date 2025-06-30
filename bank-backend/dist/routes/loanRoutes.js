"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middleware/auth"));
const LoanProduct_1 = __importDefault(require("../models/LoanProduct"));
const router = (0, express_1.Router)();
// Get all products
router.get('/', auth_1.default, async (req, res) => {
    try {
        const products = await LoanProduct_1.default.find();
        res.json(products);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
// Apply for product
router.post('/apply', auth_1.default, async (req, res) => {
    try {
        const { productId, amount, term } = req.body;
        // In a real app, you would:
        // 1. Validate application
        // 2. Check eligibility
        // 3. Create application record
        res.json({
            success: true,
            message: 'Application received',
            application: {
                productId,
                amount,
                term,
                status: 'under_review',
                reference: `APP-${Date.now()}`
            }
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Application failed' });
    }
});
exports.default = router;
