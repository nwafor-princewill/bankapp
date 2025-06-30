"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middleware/auth"));
const User_1 = __importDefault(require("../models/User"));
const router = (0, express_1.Router)();
// Get user's cards
router.get('/', auth_1.default, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.id).select('cards');
        res.json(user?.cards || []);
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cards'
        });
    }
});
// Lock/unlock card
router.post('/:cardId/lock', auth_1.default, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.id);
        const card = user?.cards.find(c => c.cardId === req.params.cardId);
        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Card not found'
            });
        }
        card.status = card.status === 'active' ? 'locked' : 'active';
        await user?.save();
        res.json({
            success: true,
            status: card.status
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to update card'
        });
    }
});
exports.default = router;
