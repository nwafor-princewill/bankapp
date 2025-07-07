// bank-backend/src/routes/adminRoutes.ts
import { Router } from 'express';
import auth from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
import User from '../models/User';
import AccountSummary from '../models/AccountSummary';
import { updateAccountBalance } from '../services/accountService';
import { TransactionType } from '../models/BankTransaction';

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
    console.log('Admin stats route hit');
    
    const users = await User.countDocuments();
    const activeUsers = await User.countDocuments();
    const totalBalance = await AccountSummary.aggregate([
      { $group: { _id: null, total: { $sum: '$currentBalance' } } }
    ]);
    
    const btcAddress = await getBtcAddress();
    
    const response = {
      users,
      activeUsers,
      totalBalance: totalBalance[0]?.total || 0,
      btcAddress
    };
    
    console.log('Sending admin stats:', response);
    res.json(response);
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    console.log('Admin users route hit');
    const users = await User.find().select('-password');
    console.log('Found users:', users.length);
    res.json(users);
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Credit user account - FIXED VERSION
router.post('/credit', auth, isAdmin, async (req, res) => {
  try {
    console.log('Admin credit route hit with body:', req.body);
    const { userEmail, accountNumber, amount, description } = req.body;
    
    if (!userEmail || !accountNumber || !amount) {
      return res.status(400).json({ message: 'Missing required fields: userEmail, accountNumber, amount' });
    }

     const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Find user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has this account
    const userAccount = user.accounts.find(acc => acc.accountNumber === accountNumber);
    if (!userAccount) {
      return res.status(404).json({ message: 'Account not found for this user' });
    }

    // Update the user's account balance directly
    await User.updateOne(
      { _id: user._id, 'accounts.accountNumber': accountNumber },
      { 
        $inc: { 'accounts.$.balance': Number(amount) },
        $set: { 'accounts.$.updatedAt': new Date() }
      }
    );

    // Also update AccountSummary if it exists
//     try {
//       await AccountSummary.findOneAndUpdate(
//         { userId: user._id, accountNumber: accountNumber },
//         { 
//           $inc: { currentBalance: Number(amount) },
//           $set: { lastUpdated: new Date() }
//         }
//       );
//     } catch (summaryErr) {
//       console.log('AccountSummary update failed (might not exist):', summaryErr);
//     }

//     console.log(`Successfully credited $${amount} to ${userEmail}'s account ${accountNumber}`);
//     res.json({ 
//       success: true, 
//       message: `Successfully credited $${amount} to ${userEmail}'s account ${accountNumber}` 
//     });
//   } catch (err) {
//     console.error('Admin credit error:', err);
//     res.status(500).json({ message: 'Server error: ' + (err instanceof Error ? err.message : String(err)) });
//   }
// });

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

    // Create transaction record
    const BankTransaction = require('../models/BankTransaction').default;
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

// Update BTC address - DEPLOYMENT READY
router.post('/update-btc', auth, isAdmin, async (req, res) => {
  try {
    const { newAddress } = req.body;
    
    if (!newAddress) {
      return res.status(400).json({ message: 'BTC address is required' });
    }

    // Save to database for deployment
    await Config.findOneAndUpdate(
      { key: 'BTC_ADDRESS' },
      { 
        key: 'BTC_ADDRESS',
        value: newAddress,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log('BTC address updated to:', newAddress);
    res.json({ success: true, message: 'BTC address updated successfully' });
  } catch (err) {
    console.error('Admin BTC update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// In bank-backend/src/routes/adminRoutes.ts
router.post('/block-user', auth, isAdmin, async (req, res) => {
  try {
    const { userId, block } = req.body; // block is boolean
    
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