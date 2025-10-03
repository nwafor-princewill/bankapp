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
import receiptRoutes from './routes/receiptRoutes';
import fs from 'fs/promises';

dotenv.config();

const app = express();

// CORS Configuration
const allowedOrigins = [
  'https://www.zenatrust.com',
  'https://zenatrust.com',
  'https://bank-dis.vercel.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., server-to-server) or from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS blocked for origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Explicitly allow headers used in requests
  exposedHeaders: ['Content-Length', 'X-Kuma-Revision'], // Optional: expose specific headers
}));

// Explicitly handle OPTIONS requests for all routes
app.options('*', cors()); // Ensure preflight requests are handled for all routes

// Middleware
app.use(express.json());

// Serve static files (profile pictures)
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Ensure upload directories
async function ensureUploadDirectories() {
  const uploadDir = path.join(process.cwd(), 'uploads', 'ids');
  try {
    const stats = await fs.stat(uploadDir);
    if (!stats.isDirectory()) {
      console.log('Removing file blocking upload directory...');
      await fs.unlink(uploadDir);
      await fs.mkdir(uploadDir, { recursive: true });
      console.log('Upload directory created successfully');
    }
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(uploadDir, { recursive: true });
      console.log('Upload directory created successfully');
    } else {
      console.error('Error ensuring upload directory:', err);
    }
  }
}

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
app.use('/api/receipts', receiptRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  ensureUploadDirectories().then(() => {
    startBlockchainListener();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
});