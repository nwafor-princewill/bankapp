import { Router } from 'express';
import auth from '../middleware/auth';
import User from '../models/User';
import AccountSummary from '../models/AccountSummary';
import BankTransaction, { TransactionType } from '../models/BankTransaction';
import { updateAccountBalance } from '../services/accountService';

const router = Router();

router.post('/', auth, async (req, res) => {
  try {
    const { bankName, toAccount, amount, description } = req.body;
    const userId = req.user?.id;

    // Validate input
    if (!bankName || !toAccount || !amount) {
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

    // Get user's primary account
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

    const primaryAccount = user.accounts[0]; // Using first account as primary

    // Check balance
    if (primaryAccount.balance < numericAmount) {
      return res.status(400).json({ 
        success: false,
        message: 'Insufficient funds' 
      });
    }

    // Create transaction record
    const reference = `TRX-${Date.now()}`;
    const newBalance = primaryAccount.balance - numericAmount;
    
    const transaction = await BankTransaction.create({
      userId,
      accountNumber: primaryAccount.accountNumber,
      amount: -numericAmount,
      type: TransactionType.TRANSFER,
      description: description || `Transfer to ${toAccount}`,
      balanceAfter: newBalance,
      recipientAccount: toAccount,
      reference,
      status: 'completed'
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
        $set: { lastTransactionDate: new Date() }
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Transfer successful',
      newBalance
    });

  } catch (err) {
    console.error('Transfer error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Transfer failed' 
    });
  }
});

export default router;