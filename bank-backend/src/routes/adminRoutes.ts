import { Router } from 'express';
import auth from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
import User from '../models/User';
import AccountSummary from '../models/AccountSummary';
import { updateAccountBalance } from '../services/accountService';
import { TransactionType } from '../models/BankTransaction';
import BankTransaction from '../models/BankTransaction';
import Receipt from '../models/receipt';
import DeletedTransaction from '../models/DeletedTransaction';

const router = Router();

// Create a simple config model for storing BTC address
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

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
      .populate('userId', 'firstName lastName')
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
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { transactionId, newDate } = req.body;
    const adminId = req.user._id; // Assuming your auth middleware adds user to req

    // Validate input
    if (!transactionId || !newDate) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Transaction ID and new date are required'
      });
    }

    const backdate = new Date(newDate);
    if (isNaN(backdate.getTime())) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    if (backdate > new Date()) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Cannot backdate to a future date'
      });
    }

    // Find and validate transaction
    const transaction = await BankTransaction.findById(transactionId).session(session);
    if (!transaction) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Store original date if not already stored
    if (!transaction.originalDate) {
      transaction.originalDate = transaction.createdAt;
    }

    // Create a deep clone of the current transaction for history
    const oldTransaction = transaction.toObject();

    // Update the transaction date
    transaction.createdAt = backdate;
    transaction.lastModifiedBy = adminId;

    // Save the transaction
    await transaction.save({ session });

    // Add this:
    await Receipt.findOneAndUpdate(
      { transactionId: transaction._id },
      { $set: { transactionDate: backdate } }
    ).session(session);

    // Update account summary
    await AccountSummary.findOneAndUpdate(
      { 
        userId: transaction.userId,
        accountNumber: transaction.accountNumber 
      },
      { $set: { lastTransactionDate: new Date() } },
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();

    // Return success response with the updated transaction
    res.json({
      success: true,
      message: 'Transaction date updated successfully',
      transaction: {
        ...transaction.toObject(),
        previousDate: oldTransaction.createdAt
      }
    });

  }  catch (err: unknown) {
    await session.abortTransaction();
    console.error('Backdate transaction error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to backdate transaction';
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
}finally {
    session.endSession();
  }
});

// Add this endpoint to get modification history
router.get('/transaction-history/:id', auth, isAdmin, async (req, res) => {
  try {
    const transaction = await BankTransaction.findById(req.params.id)
      .select('modificationHistory reference accountNumber')
      .populate('modificationHistory.changedBy', 'firstName lastName email');
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      history: transaction.modificationHistory || []
    });
  } catch (err) {
    console.error('Transaction history error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction history'
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

// Delete user permanently
router.delete('/delete-user/:userId', auth, isAdmin, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { userId } = req.params;
    
    if (!userId) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false,
        message: 'User ID is required' 
      });
    }

    // Delete user's transactions first
    await BankTransaction.deleteMany({ userId }).session(session);
    
    // Delete user's account summaries
    await AccountSummary.deleteMany({ userId }).session(session);
    
    // Finally delete the user
    const deletedUser = await User.findByIdAndDelete(userId).session(session);
    
    if (!deletedUser) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    await session.commitTransaction();
    
    res.json({
      success: true,
      message: 'User deleted permanently',
      deletedUserId: userId
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('Delete user error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete user' 
    });
  } finally {
    session.endSession();
  }
});

// Add this route before the export default line
router.delete('/delete-transaction/:transactionId', auth, isAdmin, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { transactionId } = req.params;
    const adminId = req.user._id;

    if (!transactionId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    // Find the transaction
    const transaction = await BankTransaction.findById(transactionId).session(session);
    if (!transaction) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Create a backup of the transaction before deletion
    const transactionBackup = transaction.toObject();
    
    // Delete the transaction
    await BankTransaction.deleteOne({ _id: transactionId }).session(session);
    
    // Delete associated receipt if exists
    await Receipt.deleteOne({ transactionId }).session(session);

    // Create a deletion record
    await DeletedTransaction.create({
      ...transactionBackup,
      deletedBy: adminId,
      deletionReason: 'Admin deletion',
      originalTransactionId: transactionId,
      deletedAt: new Date()
    });

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
      deletedTransactionId: transactionId
    });

  } catch (err) {
    await session.abortTransaction();
    console.error('Delete transaction error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete transaction';
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  } finally {
    session.endSession();
  }
});

// Change user password
router.post('/change-password', auth, isAdmin, async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'User ID and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password without triggering full document validation
    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      $unset: {
        resetPasswordToken: 1,
        resetPasswordExpires: 1,
      },
    });

    // Send notification email
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: 'Your Password Has Been Changed',
      text: `Dear ${user.firstName},\n\nYour password was changed by an administrator. If you did not request this change, please contact support immediately.\n\nRegards,\nZenaTrust Team`,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: `Password updated successfully for ${user.email}`,
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
    });
  }
});

// Reset user password (sends reset link)
router.post('/reset-user-password', auth, isAdmin, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry

    // Update user with reset token
    await User.findByIdAndUpdate(userId, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: new Date(resetTokenExpiry),
    });

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: 'Password Reset Request',
      text: `Dear ${user.firstName},\n\nAn administrator has initiated a password reset for your account. Please click the link to reset your password:\n\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request this reset, please contact support.\n\nRegards,\nZenaTrust Team`,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: `Password reset email sent to ${user.email}`,
    });
  } catch (err) {
    console.error('Reset user password error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate password reset',
    });
  }
});

export default router;