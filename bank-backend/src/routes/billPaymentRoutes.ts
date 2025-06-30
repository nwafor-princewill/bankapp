import { Router } from 'express';
import auth from '../middleware/auth';
// **FIX 1:** Import the 'TransactionType' enum.
import BankTransaction, { TransactionType } from '../models/BankTransaction';
import AccountSummary from '../models/AccountSummary';
import { updateAccountBalance } from '../services/accountService';

const router = Router();

// Get available billers
router.get('/billers', auth, async (req, res) => {
  try {
    // In a real app, this would come from a database
    const billers = [
      { id: 'elec-1', name: 'Electric Company', category: 'Utilities', accountNumber: 'ELEC12345' },
      { id: 'water-1', name: 'Water Works', category: 'Utilities', accountNumber: 'WATER67890' },
      { id: 'internet-1', name: 'Internet Provider', category: 'Services', accountNumber: 'NET45678' }
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

    // Check account balance
    const account = await AccountSummary.findOne({ 
      accountNumber: fromAccount,
      userId: req.user?.id
    });

    if (!account || account.availableBalance < numericAmount) {
      return res.status(400).json({ 
        success: false,
        message: 'Insufficient funds' 
      });
    }

    // Create transaction record
    const transaction = await BankTransaction.create({
      userId: req.user?.id,
      accountNumber: fromAccount,
      amount: -numericAmount,
      // **FIX 2:** Use the enum member 'TransactionType.PAYMENT'.
      type: TransactionType.PAYMENT,
      description: `Bill payment to ${billerId}`,
      balanceAfter: account.currentBalance - numericAmount,
      reference,
      status: 'completed'
    });

    // Update account balance
    await updateAccountBalance(
      req.user?.id,
      fromAccount,
      -numericAmount,
      // **FIX 3:** Use the enum member here as well.
      TransactionType.PAYMENT
    );

    res.json({
      success: true,
      message: 'Payment processed',
      transaction
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
