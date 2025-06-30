"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middleware/auth"));
const Beneficiary_1 = __importDefault(require("../models/Beneficiary"));
const router = (0, express_1.Router)();
// Get all beneficiaries
router.get('/', auth_1.default, async (req, res) => {
    try {
        const beneficiaries = await Beneficiary_1.default.find({ userId: req.user?.id });
        res.json(beneficiaries);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
// Add new beneficiary
router.post('/', auth_1.default, async (req, res) => {
    try {
        const { name, accountNumber, bankName, email, phone, nickname } = req.body;
        const beneficiary = new Beneficiary_1.default({
            userId: req.user?.id,
            name,
            accountNumber,
            bankName,
            email,
            phone,
            nickname
        });
        await beneficiary.save();
        res.status(201).json(beneficiary);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
// Delete beneficiary
router.delete('/:id', auth_1.default, async (req, res) => {
    try {
        const beneficiary = await Beneficiary_1.default.findOneAndDelete({
            _id: req.params.id,
            userId: req.user?.id
        });
        if (!beneficiary) {
            return res.status(404).json({ message: 'Beneficiary not found' });
        }
        res.json({ message: 'Beneficiary deleted' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
