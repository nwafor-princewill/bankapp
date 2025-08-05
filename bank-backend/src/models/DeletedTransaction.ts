import mongoose, { Document } from 'mongoose';
import { TransactionType, TransferType } from './BankTransaction';

export interface IDeletedTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  accountNumber: string;
  amount: number;
  type: TransactionType;
  description: string;
  balanceAfter: number;
  recipientAccount?: string;
  reference: string;
  status: string;
  currency: string;
  transferType?: TransferType;
  recipientDetails?: any;
  originalTransactionId: mongoose.Types.ObjectId;
  deletedBy: mongoose.Types.ObjectId;
  deletionReason: string;
  deletedAt: Date;
}

const DeletedTransactionSchema = new mongoose.Schema<IDeletedTransaction>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  balanceAfter: { type: Number, required: true },
  recipientAccount: { type: String },
  reference: { type: String, required: true },
  status: { type: String, default: 'completed' },
  currency: { type: String, default: 'USD' },
  transferType: { type: String },
  recipientDetails: { type: mongoose.Schema.Types.Mixed },
  originalTransactionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deletionReason: { type: String, required: true },
  deletedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IDeletedTransaction>('DeletedTransaction', DeletedTransactionSchema);