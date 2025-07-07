"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const connection_1 = __importDefault(require("./db/connection"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const cryptoRoutes_1 = __importDefault(require("./routes/cryptoRoutes"));
const blockchainListener_1 = require("./services/blockchainListener");
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
const accountRoutes_1 = __importDefault(require("./routes/accountRoutes"));
const transferRoutes_1 = __importDefault(require("./routes/transferRoutes"));
const billPaymentRoutes_1 = __importDefault(require("./routes/billPaymentRoutes"));
const cardRoutes_1 = __importDefault(require("./routes/cardRoutes"));
const redeemRoutes_1 = __importDefault(require("./routes/redeemRoutes"));
const settingsRoutes_1 = __importDefault(require("./routes/settingsRoutes"));
const beneficiaryRoutes_1 = __importDefault(require("./routes/beneficiaryRoutes"));
const loanRoutes_1 = __importDefault(require("./routes/loanRoutes"));
const serviceRequestRoutes_1 = __importDefault(require("./routes/serviceRequestRoutes"));
const accountMaintenanceRoutes_1 = __importDefault(require("./routes/accountMaintenanceRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
// app.use(cors());
// With this:
const allowedOrigins = [
    'https://www.amalgamateed.com',
    'https://amalgamateed.com',
    'https://bank-dis.vercel.app',
    'http://localhost:3000' // For local development
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/crypto', cryptoRoutes_1.default);
app.use('/api/transactions', transactionRoutes_1.default);
app.use('/api/accounts', accountRoutes_1.default);
app.use('/api/transfers', transferRoutes_1.default);
app.use('/api/bill-payments', billPaymentRoutes_1.default);
app.use('/api/cards', cardRoutes_1.default);
app.use('/api/redeem', redeemRoutes_1.default);
app.use('/api/settings', settingsRoutes_1.default);
app.use('/api/beneficiaries', beneficiaryRoutes_1.default);
app.use('/api/loans', loanRoutes_1.default);
app.use('/api/service-requests', serviceRequestRoutes_1.default);
app.use('/api/account-maintenance', accountMaintenanceRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default); // Make sure this line exists
// Start server
const PORT = process.env.PORT || 5000;
(0, connection_1.default)().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
// Add after DB connection
(0, connection_1.default)().then(() => {
    (0, blockchainListener_1.startBlockchainListener)(); // Start the blockchain listener
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
// Replace or complement your existing listener
