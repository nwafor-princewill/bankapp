import { Router } from 'express';
import auth from '../middleware/auth';
import BankTransaction, { TransactionType } from '../models/BankTransaction';
import AccountSummary from '../models/AccountSummary';
import User from '../models/User';
import { updateAccountBalance } from '../services/accountService';
import { createTransaction } from '../services/transactionService';

const router = Router();

// Get available billers - now includes all billers from your frontend
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

// Process bill payment
router.post('/', auth, async (req, res) => {
  try {
    const { fromAccount, billerId, amount, paymentDate, reference } = req.body;
    const userId = req.user?.id;

    // Validation
    if (!fromAccount || !billerId || !amount) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid amount' 
      });
    }

    // Get user and account
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const account = user.accounts.find(acc => acc.accountNumber === fromAccount);
    if (!account) {
      return res.status(400).json({ 
        success: false,
        message: 'Account not found' 
      });
    }

    // Check account balance
    if (account.balance < numericAmount) {
      return res.status(400).json({ 
        success: false,
        message: 'Insufficient funds' 
      });
    }

    // Create transaction record
    const transaction = await createTransaction(
      userId,
      fromAccount,
      -numericAmount,
      TransactionType.PAYMENT,
      `Bill payment to ${billerId}`,
      account.balance - numericAmount,
      reference,
      undefined,
      account.currency
    );

    // Update account balance
    await updateAccountBalance(
      userId,
      fromAccount,
      -numericAmount,
      TransactionType.PAYMENT
    );

    // Update user's account balance
    account.balance -= numericAmount;
    await user.save();

    res.json({
      success: true,
      message: 'Payment processed',
      transaction,
      newBalance: account.balance
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