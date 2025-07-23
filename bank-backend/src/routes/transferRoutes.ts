import { Router } from 'express';
import auth from '../middleware/auth';
import User from '../models/User';
import AccountSummary from '../models/AccountSummary';
import BankTransaction, { TransactionType, TransferType } from '../models/BankTransaction';

const router = Router();

router.post('/', auth, async (req, res) => {
  try {
    const { 
      bankName, 
      toAccount, 
      amount, 
      description,
      transferType = 'domestic', // Default to domestic if not specified
      // International transfer fields
      accountName,
      bankAddress,
      swiftIban,
      email,
      phone
    } = req.body;
    const userId = req.user?.id;

    // Validate input based on transfer type
    if (!toAccount || !amount) {
      return res.status(400).json({ 
        success: false,
        message: 'Account number and amount are required' 
      });
    }

    // Additional validation for international transfers
    if (transferType === 'international') {
      if (!accountName || !bankName || !swiftIban) {
        return res.status(400).json({
          success: false,
          message: 'For international transfers, account name, bank name, and SWIFT/IBAN are required'
        });
      }
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

    const primaryAccount = user.accounts[0];
    const currency = primaryAccount.currency || 'USD';

    // Check balance
    if (primaryAccount.balance < numericAmount) {
      return res.status(400).json({ 
        success: false,
        message: 'Insufficient funds' 
      });
    }

    // For internal transfers, verify recipient account exists
    if (transferType === 'internal') {
      const recipient = await User.findOne({ 'accounts.accountNumber': toAccount });
      if (!recipient) {
        return res.status(400).json({
          success: false,
          message: 'Recipient account not found in our bank'
        });
      }
    }

    // Calculate new balance
    const newBalance = primaryAccount.balance - numericAmount;
    
    // Create transaction record with transfer type
    await BankTransaction.create({
      userId,
      accountNumber: primaryAccount.accountNumber,
      amount: -numericAmount,
      type: TransactionType.TRANSFER,
      transferType, // This is where we use the transferType
      description: description || 
        (transferType === 'international' 
          ? `International transfer to ${accountName}` 
          : `Transfer to ${toAccount}`),
      balanceAfter: newBalance,
      recipientAccount: toAccount,
      reference: `TRX-${Date.now()}`,
      status: 'completed',
      currency,
      // Additional fields for international transfers
      ...(transferType === 'international' && {
        recipientDetails: {
          accountName,
          bankName,
          bankAddress,
          swiftIban,
          email,
          phone
        }
      })
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
      message: 'Transfer successful',
      newBalance,
      currency,
      transferType
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