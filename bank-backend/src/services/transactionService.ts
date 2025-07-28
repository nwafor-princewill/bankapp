import BankTransaction, { TransferType } from '../models/BankTransaction';
import { TransactionType } from '../models/BankTransaction';
import { updateAccountBalance } from './accountService';
import Receipt from '../models/receipt';


export const createTransaction = async (
  userId: string,
  accountNumber: string,
  amount: number,
  type: TransactionType,
  description: string,
  balanceAfter: number,
  reference: string,
  recipientAccount?: string,
  currency: string = 'USD',
  transferType?: TransferType,
  recipientDetails?: any
) => {
  const transaction = await BankTransaction.create({
    userId,
    accountNumber,
    amount,
    type,
    description,
    balanceAfter,
    recipientAccount,
    reference,
    status: 'completed',
    currency,
    transferType,
    recipientDetails
  });

  // Create receipt
  await Receipt.create({
    transactionId: transaction.reference, // Use reference as transaction ID
    userId,
    accountNumber,
    amount,
    type,
    description,
    balanceAfter,
    recipientDetails: transaction.recipientDetails,
    reference,
    status: 'completed',
    currency,
    transactionDate: transaction.createdAt
  });

  return transaction;
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