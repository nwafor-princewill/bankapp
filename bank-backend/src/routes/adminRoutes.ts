import { Router } from 'express';
import auth from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
import User from '../models/User';
import AccountSummary from '../models/AccountSummary';
import { updateAccountBalance } from '../services/accountService';
import { TransactionType } from '../models/BankTransaction';
import BankTransaction from '../models/BankTransaction';

const router = Router();

// Create a simple config model for storing BTC address
import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

const Config = mongoose.model('Config', configSchema);

// Helper function to get BTC address
const getBtcAddress = async () => {
  try {
    const config = await Config.findOne({ key: 'BTC_ADDRESS' });
    return config?.value || process.env.BTC_ADDRESS || 'bc1quu924ms2860tv59es2sqmdwkdj6me3tvrf5nmq';
  } catch (err) {
    return process.env.BTC_ADDRESS || 'bc1quu924ms2860tv59es2sqmdwkdj6me3tvrf5nmq';
  }
};

// Admin stats
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.countDocuments();
    const activeUsers = await User.countDocuments();
    const totalBalance = await AccountSummary.aggregate([
      { $group: { _id: null, total: { $sum: '$currentBalance' } } }
    ]);
    
    const btcAddress = await getBtcAddress();
    
    res.json({
      users,
      activeUsers,
      totalBalance: totalBalance[0]?.total || 0,
      btcAddress
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all transactions
router.get('/transactions', auth, isAdmin, async (req, res) => {
  try {
    const transactions = await BankTransaction.find()
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(transactions);
  } catch (err) {
    console.error('Admin transactions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Backdate transaction
router.post('/backdate-transaction', auth, isAdmin, async (req, res) => {
  try {
    const { transactionId, newDate } = req.body;

    if (!transactionId || !newDate) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID and new date are required'
      });
    }

    const backdate = new Date(newDate);
    if (backdate > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot backdate to a future date'
      });
    }

    const transaction = await BankTransaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (!transaction.originalDate) {
      transaction.originalDate = transaction.createdAt;
    }

    transaction.createdAt = backdate;
    await transaction.save();

    await AccountSummary.findOneAndUpdate(
      { 
        userId: transaction.userId,
        accountNumber: transaction.accountNumber 
      },
      { $set: { lastTransactionDate: new Date() } }
    );

    res.json({
      success: true,
      message: 'Transaction date updated successfully',
      transaction
    });
  } catch (err) {
    console.error('Backdate transaction error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to backdate transaction'
    });
  }
});

// Credit user account
router.post('/credit', auth, isAdmin, async (req, res) => {
  try {
    const { userEmail, accountNumber, amount, description } = req.body;
    
    if (!userEmail || !accountNumber || !amount) {
      return res.status(400).json({ message: 'Missing required fields: userEmail, accountNumber, amount' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userAccount = user.accounts.find(acc => acc.accountNumber === accountNumber);
    if (!userAccount) {
      return res.status(404).json({ message: 'Account not found for this user' });
    }

    await User.updateOne(
      { _id: user._id, 'accounts.accountNumber': accountNumber },
      { 
        $inc: { 'accounts.$.balance': Number(amount) },
        $set: { 'accounts.$.updatedAt': new Date() }
      }
    );

    const updatedSummary = await AccountSummary.findOneAndUpdate(
      { userId: user._id, accountNumber: accountNumber },
      { 
        $inc: { 
          currentBalance: numericAmount,
          availableBalance: numericAmount,
          'monthlyStats.totalDeposits': numericAmount,
          'monthlyStats.netChange': numericAmount
        },
        $set: { 
          lastTransactionDate: new Date(),
          updatedAt: new Date()
        }
      },
      { new: true, upsert: true }
    );

    await BankTransaction.create({
      userId: user._id,
      accountNumber: accountNumber,
      amount: numericAmount,
      type: 'deposit',
      description: description || 'Admin credit',
      balanceAfter: updatedSummary.currentBalance,
      reference: `ADMIN-CREDIT-${Date.now()}`,
      status: 'completed'
    });

    res.json({ 
      success: true, 
      message: `Successfully credited $${numericAmount.toFixed(2)} to account ${accountNumber}`,
      newBalance: updatedSummary.currentBalance
    });
  } catch (err) {
    console.error('Admin credit error:', err);
    res.status(500).json({ 
      message: 'Server error: ' + (err instanceof Error ? err.message : String(err)) 
    });
  }
});

// Update BTC address
router.post('/update-btc', auth, isAdmin, async (req, res) => {
  try {
    const { newAddress } = req.body;
    
    if (!newAddress) {
      return res.status(400).json({ message: 'BTC address is required' });
    }

    await Config.findOneAndUpdate(
      { key: 'BTC_ADDRESS' },
      { 
        key: 'BTC_ADDRESS',
        value: newAddress,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.json({ success: true, message: 'BTC address updated successfully' });
  } catch (err) {
    console.error('Admin BTC update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Block/unblock user
router.post('/block-user', auth, isAdmin, async (req, res) => {
  try {
    const { userId, block } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID is required' 
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status: block ? 'blocked' : 'active' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: `User ${block ? 'blocked' : 'unblocked'} successfully`,
      user
    });
  } catch (err) {
    console.error('Block user error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update user status' 
    });
  }
});

export default router;