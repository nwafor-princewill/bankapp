import express from 'express';
import cors from 'cors';
import path from 'path';
import connectDB from './db/connection';
import authRoutes from './routes/authRoutes';
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
import dotenv from 'dotenv';

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
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS blocked for origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());

// Middleware
app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Ensure upload directories
async function ensureUploadDirectories() {
  const uploadDir = path.join(process.cwd(), 'Uploads', 'ids');
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

// Register routes with detailed error handling
const routes = [
  { path: '/api/auth', router: authRoutes, name: 'authRoutes' },
  { path: '/api/users', router: userRoutes, name: 'userRoutes' },
  { path: '/api/crypto', router: cryptoRoutes, name: 'cryptoRoutes' },
  { path: '/api/transactions', router: transactionRoutes, name: 'transactionRoutes' },
  { path: '/api/accounts', router: accountRoutes, name: 'accountRoutes' },
  { path: '/api/transfers', router: transferRoutes, name: 'transferRoutes' },
  { path: '/api/bill-payments', router: billPaymentRoutes, name: 'billPaymentRoutes' },
  { path: '/api/cards', router: cardRoutes, name: 'cardRoutes' },
  { path: '/api/redeem', router: redeemRoutes, name: 'redeemRoutes' },
  { path: '/api/settings', router: settingsRoutes, name: 'settingsRoutes' },
  { path: '/api/beneficiaries', router: beneficiaryRoutes, name: 'beneficiaryRoutes' },
  { path: '/api/loans', router: loanRoutes, name: 'loansRoutes' },
  { path: '/api/service-requests', router: serviceRequestRoutes, name: 'serviceRequestRoutes' },
  { path: '/api/account-maintenance', router: accountMaintenanceRoutes, name: 'accountMaintenanceRoutes' },
  { path: '/api/admin', router: adminRoutes, name: 'adminRoutes' },
  { path: '/api/receipts', router: receiptRoutes, name: 'receiptRoutes' },
];

routes.forEach(({ path, router, name }) => {
  try {
    app.use(path, router);
    console.log(`Successfully registered route: ${name} at ${path}`);
  } catch (err) {
    console.error(`Error registering route ${name} at ${path}:`, err);
  }
});

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
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});