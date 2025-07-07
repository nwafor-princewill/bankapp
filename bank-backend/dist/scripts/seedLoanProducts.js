"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// bank-backend/src/scripts/seedLoanProducts.ts
const mongoose_1 = __importDefault(require("mongoose"));
const LoanProduct_1 = __importStar(require("../models/LoanProduct"));
const sampleProducts = [
    // Loans
    {
        name: 'Personal Loan',
        type: LoanProduct_1.ProductType.LOAN,
        description: 'Quick personal loans for your immediate needs with competitive rates.',
        interestRate: 8.5,
        minAmount: 1000,
        maxAmount: 50000,
        term: '12-60 months',
        features: [
            'Quick approval within 24 hours',
            'No collateral required',
            'Flexible repayment terms',
            'Online application process'
        ],
        eligibility: [
            'Minimum age 21 years',
            'Stable income for 6 months',
            'Good credit score'
        ]
    },
    {
        name: 'Home Loan',
        type: LoanProduct_1.ProductType.LOAN,
        description: 'Make your dream home a reality with our affordable home loans.',
        interestRate: 6.5,
        minAmount: 50000,
        maxAmount: 500000,
        term: '15-30 years',
        features: [
            'Low interest rates',
            'Up to 90% financing',
            'Flexible EMI options',
            'Tax benefits available'
        ],
        eligibility: [
            'Minimum age 23 years',
            'Stable employment',
            'Property documents required'
        ]
    },
    {
        name: 'Car Loan',
        type: LoanProduct_1.ProductType.LOAN,
        description: 'Drive your dream car today with our easy car financing options.',
        interestRate: 7.2,
        minAmount: 10000,
        maxAmount: 100000,
        term: '12-84 months',
        features: [
            'Quick processing',
            'Up to 100% financing',
            'Competitive interest rates',
            'Insurance options available'
        ],
        eligibility: [
            'Valid driving license',
            'Minimum age 21 years',
            'Income proof required'
        ]
    },
    // Investments
    {
        name: 'Fixed Deposit',
        type: LoanProduct_1.ProductType.INVESTMENT,
        description: 'Secure your money with guaranteed returns through our fixed deposit schemes.',
        interestRate: 5.5,
        minAmount: 500,
        maxAmount: 1000000,
        term: '6 months - 5 years',
        features: [
            'Guaranteed returns',
            'Flexible tenure options',
            'Loan against FD available',
            'Auto-renewal facility'
        ],
        eligibility: [
            'Minimum age 18 years',
            'Valid ID proof',
            'Minimum deposit amount'
        ]
    },
    {
        name: 'Mutual Fund SIP',
        type: LoanProduct_1.ProductType.INVESTMENT,
        description: 'Start investing systematically with our mutual fund SIP options.',
        interestRate: 12.0,
        minAmount: 100,
        maxAmount: 100000,
        term: '1 year - 20 years',
        features: [
            'Start with just $100',
            'Diversified portfolio',
            'Professional fund management',
            'Tax saving options'
        ],
        eligibility: [
            'Minimum age 18 years',
            'KYC compliance',
            'Risk assessment required'
        ]
    },
    // Services
    {
        name: 'Digital Banking',
        type: LoanProduct_1.ProductType.SERVICE,
        description: 'Complete banking services at your fingertips with our mobile app.',
        minAmount: 0,
        maxAmount: 0,
        term: 'Ongoing',
        features: [
            '24/7 account access',
            'Mobile check deposit',
            'Bill pay services',
            'Real-time notifications'
        ],
        eligibility: [
            'Existing account holder',
            'Smartphone required',
            'Valid email address'
        ]
    },
    {
        name: 'Wealth Management',
        type: LoanProduct_1.ProductType.SERVICE,
        description: 'Personalized wealth management services for high-net-worth individuals.',
        minAmount: 100000,
        maxAmount: 0,
        term: 'Ongoing',
        features: [
            'Dedicated relationship manager',
            'Investment advisory',
            'Estate planning',
            'Tax optimization'
        ],
        eligibility: [
            'Minimum portfolio value',
            'Existing premier customer',
            'Financial assessment required'
        ]
    },
    {
        name: 'Insurance Services',
        type: LoanProduct_1.ProductType.SERVICE,
        description: 'Comprehensive insurance solutions to protect you and your family.',
        minAmount: 12,
        maxAmount: 10000,
        term: 'Annual',
        features: [
            'Life insurance',
            'Health insurance',
            'Property insurance',
            'Claims assistance'
        ],
        eligibility: [
            'Age 18-65 years',
            'Medical checkup may be required',
            'Premium payment capability'
        ]
    }
];
async function seedLoanProducts() {
    try {
        // Connect to MongoDB
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bank-app');
        console.log('Connected to MongoDB');
        // Clear existing products
        await LoanProduct_1.default.deleteMany({});
        console.log('Cleared existing loan products');
        // Insert sample products
        await LoanProduct_1.default.insertMany(sampleProducts);
        console.log('Sample loan products inserted successfully');
        // Close connection
        await mongoose_1.default.connection.close();
        console.log('Database connection closed');
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}
seedLoanProducts();
