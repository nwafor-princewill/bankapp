import express from 'express';
import cors from 'cors';
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

// Middleware
app.use(cors());
app.use(express.json());

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
app.use('/api/admin', adminRoutes); // Make sure this line exists

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// Add after DB connection
connectDB().then(() => {
  startBlockchainListener(); // Start the blockchain listener
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// Replace or complement your existing listener
