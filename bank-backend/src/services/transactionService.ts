import BankTransaction from '../models/BankTransaction';
import { TransactionType } from '../models/BankTransaction';
import { updateAccountBalance } from './accountService';


export const createTransaction = async (
  userId: string,
  accountNumber: string,
  amount: number,
  type: TransactionType,
  description: string,
  balanceAfter: number,
  reference: string,
  recipientAccount?: string
) => {
  return BankTransaction.create({
    userId,
    accountNumber,
    amount,
    type,
    description,
    balanceAfter,
    recipientAccount,
    reference,
    status: 'completed'
  });
};

// ... after creating transaction
export const updateAccountAfterTransaction = async (
  userId: string,
  accountNumber: string,
  amount: number,
  type: TransactionType
) => {
  await updateAccountBalance(
    userId,
    accountNumber,
    amount,
    type
  );
};



export const getAccountTransactions = async (
  userId: string,
  accountNumber: string,
  limit: number = 10
) => {
  return BankTransaction.find({ userId, accountNumber })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};