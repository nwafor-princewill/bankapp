import { Router } from 'express';
import auth from '../middleware/auth';
import BankTransaction, { TransactionType } from '../models/BankTransaction';
import AccountSummary from '../models/AccountSummary';
import User from '../models/User';
import { updateAccountBalance } from '../services/accountService';
import { createTransaction } from '../services/transactionService';
import Receipt from '../models/receipt';
import { sendTransferOtpEmail } from '../utils/emailService';

const router = Router();

// Get available billers
router.get('/billers', auth, async (req, res) => {
  try {
    const billers = [
      { id: '1', name: 'Electricity Company', category: 'Utilities', accountNumber: 'ELEC-12345' },
      { id: '2', name: 'Water Corporation', category: 'Utilities', accountNumber: 'WATER-67890' },
      { id: '3', name: 'Internet Provider', category: 'Telecom', accountNumber: 'NET-54321' },
      { id: '4', name: 'Cable TV', category: 'Entertainment', accountNumber: 'TV-98765' },
      { id: '5', name: 'Mobile Carrier', category: 'Telecom', accountNumber: 'MOBILE-13579' }
    ];
    res.json(billers);
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch billers' 
    });
  }
});

// Add global type declaration for otpStore
declare global {
  // eslint-disable-next-line no-var
  var otpStore: { [userId: string]: { otp: string; expires: number } };
}

// Initiate bill payment (send OTP)
router.post('/initiate', auth, async (req, res) => {
  try {
    const { billerId, amount, paymentDate, reference, billerName } = req.body;
    const userId = req.user?.id;

    // Validation
    if (!billerId || !amount) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid amount' 
      });
    }

    const billers = [
      { id: '1', name: 'Electricity Company', category: 'Utilities', accountNumber: 'ELEC-12345' },
      { id: '2', name: 'Water Corporation', category: 'Utilities', accountNumber: 'WATER-67890' },
      { id: '3', name: 'Internet Provider', category: 'Telecom', accountNumber: 'NET-54321' },
      { id: '4', name: 'Cable TV', category: 'Entertainment', accountNumber: 'TV-98765' },
      { id: '5', name: 'Mobile Carrier', category: 'Telecom', accountNumber: 'MOBILE-13579' }
    ];
    const biller = billers.find(b => b.id === billerId);
    if (!biller) {
      return res.status(400).json({
        success: false,
        message: 'Invalid biller'
      });
    }

    // Fetch user for email and firstName
    const user = await User.findById(userId);
    if (!user || !user.email) {
      return res.status(400).json({
        success: false,
        message: 'User email not found'
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP (temporary in-memory for simplicity; use Redis/MongoDB in production)
    // For now, assume stored in a simple in-memory object (not persistent)
    globalThis.otpStore = globalThis.otpStore || {};
    globalThis.otpStore[userId] = { otp, expires: Date.now() + 10 * 60 * 1000 }; // 10-min expiry

    // Send OTP email
    const emailSent = await sendTransferOtpEmail({
      email: user.email,
      otp,
      firstName: user.firstName || 'Customer'
    });

    if (!emailSent) {
      throw new Error('Failed to send OTP email');
    }

    res.json({
      success: true,
      message: 'OTP sent to registered email'
    });
  } catch (err) {
    console.error('Bill payment initiation error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to initiate bill payment' 
    });
  }
});

// Process bill payment (with OTP)
router.post('/', auth, async (req, res) => {
  try {
    const { billerId, amount, paymentDate, reference, billerName, otp } = req.body;
    const userId = req.user?.id;

    // Validation
    if (!billerId || !amount || !otp) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid amount' 
      });
    }

    // Verify OTP
    globalThis.otpStore = globalThis.otpStore || {};
    const storedOtp = globalThis.otpStore[userId];
    if (!storedOtp || storedOtp.otp !== otp || storedOtp.expires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Clear OTP after use
    delete globalThis.otpStore[userId];

    // Get user and primary account
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    if (!user.accounts || user.accounts.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No account found for this user' 
      });
    }

    const primaryAccount = user.accounts[0];
    const currency = primaryAccount.currency || 'USD';

    // Check balance
    if (primaryAccount.balance < numericAmount) {
      return res.status(400).json({ 
        success: false,
        message: 'Insufficient funds' 
      });
    }

    // Find biller details
    const billers = [
      { id: '1', name: 'Electricity Company', category: 'Utilities', accountNumber: 'ELEC-12345' },
      { id: '2', name: 'Water Corporation', category: 'Utilities', accountNumber: 'WATER-67890' },
      { id: '3', name: 'Internet Provider', category: 'Telecom', accountNumber: 'NET-54321' },
      { id: '4', name: 'Cable TV', category: 'Entertainment', accountNumber: 'TV-98765' },
      { id: '5', name: 'Mobile Carrier', category: 'Telecom', accountNumber: 'MOBILE-13579' }
    ];
    const biller = billers.find(b => b.id === billerId);
    if (!biller) {
      return res.status(400).json({
        success: false,
        message: 'Invalid biller'
      });
    }

    // Calculate new balance
    const newBalance = primaryAccount.balance - numericAmount;
    
    // Create transaction record
    const transaction = await createTransaction(
      userId,
      primaryAccount.accountNumber,
      -numericAmount,
      TransactionType.PAYMENT,
      `Bill payment to ${biller.name}`,
      newBalance,
      reference || `BILL-${Date.now()}`,
      biller.accountNumber,
      currency,
      undefined,
      {
        accountName: biller.name,
        accountNumber: biller.accountNumber
      }
    );

    // Add receipt creation
    await Receipt.create({
      transactionId: (transaction._id as any).toString(),
      reference: transaction.reference,
      userId: userId,
      accountNumber: primaryAccount.accountNumber,
      amount: -numericAmount,
      type: TransactionType.PAYMENT,
      description: `Bill payment to ${biller.name}`,
      balanceAfter: newBalance,
      status: 'completed',
      currency: currency,
      transactionDate: new Date(),
      recipientDetails: {
        accountName: biller.name,
        accountNumber: biller.accountNumber
      }
    });

    // Update user account balance
    primaryAccount.balance = newBalance;
    await user.save();

    // Update AccountSummary
    await AccountSummary.findOneAndUpdate(
      { userId, accountNumber: primaryAccount.accountNumber },
      {
        $inc: { 
          currentBalance: -numericAmount,
          availableBalance: -numericAmount,
          'monthlyStats.totalWithdrawals': numericAmount,
          'monthlyStats.netChange': -numericAmount
        },
        $set: { 
          lastTransactionDate: new Date(),
          currency
        }
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Payment successful',
      newBalance,
      currency,
      reference: transaction.reference
    });

  } catch (err) {
    console.error('Bill payment error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Payment failed' 
    });
  }
});

export default router;