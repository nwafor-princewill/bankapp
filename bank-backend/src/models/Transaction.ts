import mongoose, { Document } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  txid: string;
  amount: number;
  currency: string;
  confirmations: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
}

const transactionSchema = new mongoose.Schema<ITransaction>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  txid: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'BTC' },
  confirmations: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<ITransaction>('Transaction', transactionSchema);