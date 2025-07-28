import { Router } from 'express';
import auth from '../middleware/auth';
import BankTransaction, { TransactionType } from '../models/BankTransaction';
import AccountSummary from '../models/AccountSummary';
import User from '../models/User';
import { updateAccountBalance } from '../services/accountService';
import { createTransaction } from '../services/transactionService';
import Receipt from '../models/receipt';

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

// Process bill payment (now works like transfer)
router.post('/', auth, async (req, res) => {
  try {
    const { billerId, amount, paymentDate, reference } = req.body;
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

    // Get user and primary account (like transfer code)
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

    // Calculate new balance
    const newBalance = primaryAccount.balance - numericAmount;
    
    // Create transaction record
    const transaction = await createTransaction(
      userId,
      primaryAccount.accountNumber,
      -numericAmount,
      TransactionType.PAYMENT,
      `Bill payment to ${billerId}`,
      newBalance,
      reference,
      undefined,
      currency
    );

    // Add receipt creation
    await Receipt.create({
      transactionId: transaction._id,
      reference: reference || `BILL-${Date.now()}`,
      userId: userId,
      accountNumber: primaryAccount.accountNumber,
      amount: -numericAmount,
      type: TransactionType.PAYMENT,
      description: `Bill payment to ${billerId}`,
      balanceAfter: newBalance,
      status: 'completed',
      currency: currency,
      transactionDate: new Date()
    });

    // Update user account balance
    primaryAccount.balance = newBalance;
    await user.save();

    // Update AccountSummary (like transfer code)
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
      currency
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