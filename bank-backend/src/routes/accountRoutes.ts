import { Router } from 'express';
import auth from '../middleware/auth';
import { getAccountSummary } from '../services/accountService';
import User from '../models/User';
import AccountSummary from '../models/AccountSummary';

const router = Router();

// @route   GET /api/accounts/summary
router.get('/summary', auth, async (req, res) => {
  try {
    // Add validation
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const accountNumber = req.query.accountNumber as string;
    
    if (!accountNumber) {
      return res.status(400).json({ 
        success: false,
        message: 'Account number required',
        data: null
      });
    }

    const summary = await getAccountSummary(req.user.id, accountNumber);
    
    res.json({
      success: true,
      message: 'Account summary retrieved',
      data: summary
    });
    
  } catch (err) {
    console.error('Account summary error:', err);
    res.status(500).json({ 
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? err instanceof Error ? err.message : 'Server error'
        : 'Server error',
      data: null
    });
  }
});

// Add this to bank-backend/src/routes/accountRoutes.ts
router.get('/primary', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select('accounts');
    if (!user || !user.accounts || user.accounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No account found'
      });
    }

    const primaryAccount = user.accounts[0];
    
    res.json({
      success: true,
      accountNumber: primaryAccount.accountNumber,
      balance: primaryAccount.balance,
      currency: primaryAccount.currency || 'USD'
    });
    
  } catch (err) {
    console.error('Primary account error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch account details'
    });
  }
});

router.get('/summary', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user || !user.accounts || user.accounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No account found'
      });
    }

    const primaryAccount = user.accounts[0];
    const summary = await AccountSummary.findOne({
      userId: req.user?.id,
      accountNumber: primaryAccount.accountNumber
    });

    res.json({
      success: true,
      data: {
        availableBalance: primaryAccount.balance,
        currentBalance: primaryAccount.balance,
        currency: primaryAccount.currency || 'USD',
        lastTransactionDate: summary?.lastTransactionDate || new Date(),
        monthlyStats: summary?.monthlyStats || {
          totalDeposits: 0,
          totalWithdrawals: 0,
          netChange: 0
        }
      }
    });
  } catch (err) {
    console.error('Account summary error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch account summary'
    });
  }
});

export default router;