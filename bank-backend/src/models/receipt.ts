import mongoose, { Document } from 'mongoose';

export interface IReceipt extends Document {
  transactionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  accountNumber: string;
  amount: number;
  type: string;
  description: string;
  balanceAfter: number;
  recipientDetails?: any;
  reference: string;
  status: string;
  currency: string;
  transactionDate: Date;
  createdAt: Date;
}

const receiptSchema = new mongoose.Schema<IReceipt>({
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'BankTransaction', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  balanceAfter: { type: Number, required: true },
  recipientDetails: { type: mongoose.Schema.Types.Mixed },
  reference: { type: String, required: true },
  status: { type: String, required: true },
  currency: { type: String, default: 'USD' },
  transactionDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IReceipt>('Receipt', receiptSchema);