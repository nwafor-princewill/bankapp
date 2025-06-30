"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middleware/auth"));
const ServiceRequest_1 = __importDefault(require("../models/ServiceRequest"));
const router = (0, express_1.Router)();
// Submit service request
router.post('/', auth_1.default, async (req, res) => {
    try {
        const { requestType, details } = req.body;
        const request = new ServiceRequest_1.default({
            userId: req.user?.id,
            requestType,
            details,
            status: 'open'
        });
        await request.save();
        res.status(201).json({
            success: true,
            request,
            message: 'Request submitted successfully'
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to submit request'
        });
    }
});
// Get user's requests
router.get('/', auth_1.default, async (req, res) => {
    try {
        const requests = await ServiceRequest_1.default.find({ userId: req.user?.id })
            .sort({ createdAt: -1 });
        res.json({ success: true, requests });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch requests'
        });
    }
});
exports.default = router;
