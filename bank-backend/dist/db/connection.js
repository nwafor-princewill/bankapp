"use strict";
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// dotenv.config();
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI!);
//     console.log('MongoDB Connected...');
//   } catch (err) {
//     console.error('Database connection error:', err);
//     process.exit(1);
//   }
// };
// export default connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI; // Changed from MONGO_URI
        if (!uri)
            throw new Error("MONGODB_URI not found in environment variables");
        await mongoose_1.default.connect(uri);
        console.log('MongoDB Connected...');
    }
    catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
};
exports.default = connectDB;
