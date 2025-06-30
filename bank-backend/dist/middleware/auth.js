"use strict";
// src/middleware/auth.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// We no longer need the 'AuthenticatedRequest' interface here. It's been deleted.
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).send({ error: 'Authentication required. No token provided.' });
        }
        // Ensure your .env file has JWT_SECRET defined
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await User_1.default.findById(decoded.userId);
        if (!user) {
            return res.status(401).send({ error: 'Authentication failed. User not found.' });
        }
        req.user = user;
        next();
    }
    catch (err) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};
exports.default = auth;
