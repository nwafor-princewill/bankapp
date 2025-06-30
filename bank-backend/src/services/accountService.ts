import mongoose from 'mongoose';
import AccountSummary from '../models/AccountSummary';
import BankTransaction from '../models/BankTransaction';
import { TransactionType } from '../models/BankTransaction';

export const getAccountSummary = async (userId: string, accountNumber: string) => {
  // Get or create summary
  let summary = await AccountSummary.findOne({ userId, accountNumber });
  
  if (!summary) {
    summary = await AccountSummary.create({
      userId,
      accountNumber,
      currentBalance: 0,
      availableBalance: 0,
      currency: 'USD'
    });
  }

  // Calculate monthly stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyTransactions = await BankTransaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        accountNumber,
        createdAt: { $gte: startOfMonth }
      }
    },
    {
      $group: {
        _id: null,
        totalDeposits: {
          $sum: {
            $cond: [{ $eq: ['$type', 'deposit'] }, '$amount', 0]
          }
        },
        totalWithdrawals: {
          $sum: {
            $cond: [{ $in: ['$type', ['withdrawal', 'payment']] }, '$amount', 0]
          }
        }
      }
    }
  ]);

  // Update summary if transactions exist
  if (monthlyTransactions.length > 0) {
    const stats = monthlyTransactions[0];
    summary.monthlyStats = {
      totalDeposits: stats.totalDeposits,
      totalWithdrawals: stats.totalWithdrawals,
      netChange: stats.totalDeposits - stats.totalWithdrawals
    };
    await summary.save();
  }

  return summary;
};

export const updateAccountBalance = async (
  userId: string,
  accountNumber: string,
  amount: number,
  transactionType: TransactionType
) => {
  const update = {
    $inc: {
      currentBalance: amount,
      availableBalance: amount,
      ...(transactionType === 'deposit' && {
        'monthlyStats.totalDeposits': amount
      }),
      ...((transactionType === 'withdrawal' || transactionType === 'payment') && {
        'monthlyStats.totalWithdrawals': amount
      })
    },
    $set: {
      lastTransactionDate: new Date()
    }
  };

  await AccountSummary.findOneAndUpdate(
    { userId, accountNumber },
    update,
    { new: true, upsert: true }
  );
};