"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductType = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
var ProductType;
(function (ProductType) {
    ProductType["LOAN"] = "loan";
    ProductType["INVESTMENT"] = "investment";
    ProductType["SERVICE"] = "service";
})(ProductType || (exports.ProductType = ProductType = {}));
const LoanProductSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: Object.values(ProductType), required: true },
    description: { type: String, required: true },
    interestRate: { type: Number },
    minAmount: { type: Number, default: 0 },
    maxAmount: { type: Number },
    term: { type: String },
    features: { type: [String], default: [] },
    eligibility: { type: [String], default: [] }
}, { timestamps: true });
exports.default = mongoose_1.default.model('LoanProduct', LoanProductSchema);
