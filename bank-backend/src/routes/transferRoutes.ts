import { Router } from 'express';
import auth from '../middleware/auth';
import transactionAuth from '../middleware/transactionAuth';
import User from '../models/User';
import AccountSummary from '../models/AccountSummary';
import BankTransaction, { TransactionType, TransferType } from '../models/BankTransaction';
import Receipt from '../models/receipt';
import bcrypt from 'bcryptjs';
import { sendTransferOtpEmail } from '../utils/emailService';

const router = Router();

const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// =================================================================
// STEP 1: INITIATE TRANSFER & SEND OTP
// =================================================================
router.post('/initiate', auth, transactionAuth, async (req, res) => {
  try {
    const { bankName, toAccount, amount, description, transferType = 'domestic', accountName, bankAddress, swiftIban, email, phone } = req.body;
    const userId = req.user?._id;

    /* // ====== REMOVED PIN VERIFICATION BLOCK ======
    const userWithPin = await User.findById(userId).select('+transferPin transferPinSet');
    
    if (userWithPin?.transferPinSet) {
      if (!pin) {
        return res.status(403).json({
          success: false,
          message: 'Transfer PIN required',
          requiresPin: true
        });
      }
      
      if (!userWithPin.transferPin) {
        return res.status(400).json({
          success: false,
          message: 'Transfer PIN not properly set'
        });
      }
      
      const isMatch = await bcrypt.compare(pin, userWithPin.transferPin);
      if (!isMatch) {
        return res.status(403).json({
          success: false,
          message: 'Invalid transfer PIN'
        });
      }
    }
    // ====== END OF REMOVED PIN VERIFICATION BLOCK ====== */

    // Validate input based on transfer type
    if (!toAccount || !amount) {
      return res.status(400).json({ 
        success: false,
        message: 'Account number and amount are required' 
      });
    }

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

    if (primaryAccount.balance < numericAmount) {
      return res.status(400).json({ 
        success: false,
        message: 'Insufficient funds' 
      });
    }

    if (transferType === 'internal') {
      const recipient = await User.findOne({ 'accounts.accountNumber': toAccount });
      if (!recipient) {
        return res.status(400).json({
          success: false,
          message: 'Recipient account not found in our bank'
        });
      }
    }

    const otp = generateOtp();
    const salt = await bcrypt.genSalt(10);
    user.transferOtp = await bcrypt.hash(otp, salt);
    user.transferOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendTransferOtpEmail({
      email: user.email,
      otp: otp,
      firstName: user.firstName,
    });

    res.json({
      success: true,
      message: 'An OTP has been sent to your registered email address.',
    });

  } catch (err) {
    console.error('Transfer initiation error:', err);
    res.status(500).json({ success: false, message: 'Failed to initiate transfer' });
  }
});

// =================================================================
// STEP 2: EXECUTE TRANSFER WITH OTP
// =================================================================
router.post('/', auth, transactionAuth, async (req, res) => {
  try {
    const { otp, ...transferData } = req.body;
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
    } = transferData;
    
    const userId = req.user?.id;

    if (!otp) {
        return res.status(400).json({ success: false, message: 'OTP is required' });
    }

    const user = await User.findById(userId).select('+transferOtp +transferOtpExpires');
    if (!user || !user.transferOtp || !user.transferOtpExpires) {
      return res.status(400).json({ success: false, message: 'No pending transfer found. Please try again.' });
    }

    if (new Date() > user.transferOtpExpires) {
      user.transferOtp = undefined;
      user.transferOtpExpires = undefined;
      await user.save();
      return res.status(400).json({ success: false, message: 'OTP has expired. Please try again.' });
    }

    const isOtpMatch = await bcrypt.compare(otp, user.transferOtp);
    if (!isOtpMatch) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    if (!toAccount || !amount) {
      return res.status(400).json({ 
        success: false,
        message: 'Account number and amount are required' 
      });
    }

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

    if (!user.accounts || user.accounts.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No account found for this user' 
      });
    }

    const primaryAccount = user.accounts[0];
    const currency = primaryAccount.currency || 'USD';

    if (primaryAccount.balance < numericAmount) {
      return res.status(400).json({ 
        success: false,
        message: 'Insufficient funds' 
      });
    }

    if (transferType === 'internal') {
      const recipient = await User.findOne({ 'accounts.accountNumber': toAccount });
      if (!recipient) {
        return res.status(400).json({
          success: false,
          message: 'Recipient account not found in our bank'
        });
      }
    }

    const newBalance = primaryAccount.balance - numericAmount;
    
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

    user.accounts[0].balance = newBalance;
    user.transferOtp = undefined;
    user.transferOtpExpires = undefined;
    await user.save();

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
    console.error('Transfer execution error:', err);
    try {
        const user = await User.findById(req.user?.id);
        if (user) {
            user.transferOtp = undefined;
            user.transferOtpExpires = undefined;
            await user.save();
        }
    } catch (clearErr) {
        console.error('Failed to clear OTP after error:', clearErr);
    }
    res.status(500).json({ 
      success: false,
      message: 'Transfer failed' 
    });
  }
});

export default router;