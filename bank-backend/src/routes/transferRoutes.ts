import { Router } from 'express';
import auth from '../middleware/auth';
import BankTransaction, { TransactionType } from '../models/BankTransaction';
import AccountSummary from '../models/AccountSummary';
import { updateAccountBalance } from '../services/accountService';

const router = Router();

router.post('/', auth, async (req, res) => {
  try {
    const { fromAccount, toAccount, amount, description } = req.body;

    // Validation
    if (!fromAccount || !toAccount || !amount) {
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

    // Check if sender has sufficient balance
    const senderAccount = await AccountSummary.findOne({ 
      accountNumber: fromAccount,
      userId: req.user?.id
    });

    if (!senderAccount || senderAccount.availableBalance < numericAmount) {
      return res.status(400).json({ 
        success: false,
        message: 'Insufficient funds' 
      });
    }

    // Create transaction records
    const reference = `TRX-${Date.now()}`;
    
    // Outbound transaction (from sender)
    const outboundTx = await BankTransaction.create({
      userId: req.user?.id,
      accountNumber: fromAccount,
      amount: -numericAmount,
            // **FIXED:** Use the enum member
      type: TransactionType.TRANSFER,
    //   type: 'transfer',
      description,
      recipientAccount: toAccount,
      balanceAfter: senderAccount.currentBalance - numericAmount,
      reference,
      status: 'completed'
    });

    // Update sender's balance
    await updateAccountBalance(
      req.user?.id,
      fromAccount,
      -numericAmount,
        // **FIXED:** Use the enum member here as well
      TransactionType.TRANSFER
    //   'transfer'
    );

    // Inbound transaction (to recipient)
    const inboundTx = await BankTransaction.create({
      userId: req.user?.id, // In real app, this would be recipient's user ID
      accountNumber: toAccount,
      amount: numericAmount,
      // **FIXED:** Use the enum member for deposit
      type: TransactionType.DEPOSIT,
    //   type: 'deposit',
      description: `Transfer from ${fromAccount}`,
      balanceAfter: 0, // Would be calculated in real app
      reference,
      status: 'completed'
    });

    // Update recipient's balance (in real app)
    // await updateAccountBalance(recipientUserId, toAccount, numericAmount, 'deposit');

    res.json({
      success: true,
      message: 'Transfer successful',
      transaction: outboundTx
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