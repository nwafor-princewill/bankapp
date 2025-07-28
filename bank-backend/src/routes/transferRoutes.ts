import { Router } from 'express';
import auth from '../middleware/auth';
import User from '../models/User';
import AccountSummary from '../models/AccountSummary';
import BankTransaction, { TransactionType, TransferType } from '../models/BankTransaction';
import Receipt from '../models/receipt';

const router = Router();

router.post('/', auth, async (req, res) => {
  try {
    const { 
      bankName, 
      toAccount, 
      amount, 
      description,
      transferType = 'domestic',
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
    
    // Prepare recipient details for all transfer types
    const recipientDetails = {
      accountName: accountName || (transferType === 'internal' ? 'Internal Recipient' : bankName || 'External Recipient'),
      accountNumber: toAccount,
      ...(transferType === 'international' && {
        bankName,
        bankAddress,
        swiftIban,
        email,
        phone
      })
    };

    const transaction = await BankTransaction.create({
      userId,
      accountNumber: primaryAccount.accountNumber,
      amount: -numericAmount,
      type: TransactionType.TRANSFER,
      transferType,
      description: description || 
        (transferType === 'international' 
          ? `International transfer to ${accountName}` 
          : `Transfer to ${toAccount}`),
      balanceAfter: newBalance,
      recipientAccount: toAccount,
      reference: `TRX-${Date.now()}`,
      status: 'completed',
      currency,
      recipientDetails
    });

    // Create receipt with consistent recipient details
    await Receipt.create({
      transactionId: (transaction._id as string | { toString(): string }).toString(),
      reference: transaction.reference,
      userId: userId,
      accountNumber: primaryAccount.accountNumber,
      amount: -numericAmount,
      type: TransactionType.TRANSFER,
      description: description || 
        (transferType === 'international' 
          ? `International transfer to ${accountName}` 
          : `Transfer to ${toAccount}`),
      balanceAfter: newBalance,
      recipientDetails,
      status: 'completed',
      currency: currency,
      transactionDate: new Date()
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
      transferType,
      reference: transaction.reference
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