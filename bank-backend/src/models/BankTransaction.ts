import mongoose, { Document } from 'mongoose';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  PAYMENT = 'payment'
}

interface IBankTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  accountNumber: string;
  amount: number;
  type: TransactionType;
  description: string;
  balanceAfter: number;
  recipientAccount?: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
}

const BankTransactionSchema = new mongoose.Schema<IBankTransaction>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { 
    type: String, 
    enum: Object.values(TransactionType),
    required: true 
  },
  description: { type: String, required: true },
  balanceAfter: { type: Number, required: true },
  recipientAccount: { type: String },
  reference: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'],
    default: 'completed' 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true } 
});

// Indexes for faster queries
BankTransactionSchema.index({ userId: 1, createdAt: -1 });
BankTransactionSchema.index({ accountNumber: 1 });

export default mongoose.model<IBankTransaction>('BankTransaction', BankTransactionSchema);