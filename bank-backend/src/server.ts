import express from 'express';
import cors from 'cors';
import path from 'path';
import connectDB from './db/connection';
import authRoutes from './routes/authRoutes';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import cryptoRoutes from './routes/cryptoRoutes';
import { startBlockchainListener } from './services/blockchainListener';
import transactionRoutes from './routes/transactionRoutes';
import accountRoutes from './routes/accountRoutes';
import transferRoutes from './routes/transferRoutes';
import billPaymentRoutes from './routes/billPaymentRoutes';
import cardRoutes from './routes/cardRoutes';
import redeemRoutes from './routes/redeemRoutes';
import settingsRoutes from './routes/settingsRoutes';
import beneficiaryRoutes from './routes/beneficiaryRoutes';
import loanRoutes from './routes/loanRoutes';
import serviceRequestRoutes from './routes/serviceRequestRoutes';
import accountMaintenanceRoutes from './routes/accountMaintenanceRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();

// CORS Configuration
const allowedOrigins = [
  'https://www.amalgamateed.com',
  'https://amalgamateed.com',
  'https://bank-dis.vercel.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Middleware
app.use(express.json());

// Serve static files (profile pictures)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/bill-payments', billPaymentRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/redeem', redeemRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/account-maintenance', accountMaintenanceRoutes);
app.use('/api/admin', adminRoutes);

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  startBlockchainListener();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});