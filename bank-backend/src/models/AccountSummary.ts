import mongoose, { Document } from 'mongoose';

interface IAccountSummary extends Document {
  userId: mongoose.Types.ObjectId;
  accountNumber: string;
  currentBalance: number;
  availableBalance: number;
  currency: string;
  lastTransactionDate: Date;
  monthlyStats: {
    totalDeposits: number;
    totalWithdrawals: number;
    netChange: number;
  };
}

const AccountSummarySchema = new mongoose.Schema<IAccountSummary>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true,
    index: true  // Keep index definition here (remove the explicit index call below)
  },
  accountNumber: { 
    type: String, 
    required: true, 
    unique: true,
    index: true  // Keep index definition here (remove the explicit index call below)
  },
  currentBalance: { type: Number, required: true, default: 0 },
  availableBalance: { type: Number, required: true, default: 0 },
  currency: { type: String, default: 'USD' },
  lastTransactionDate: { type: Date },
  monthlyStats: {
    totalDeposits: { type: Number, default: 0 },
    totalWithdrawals: { type: Number, default: 0 },
    netChange: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Remove these explicit index calls since we're using the schema option above
// AccountSummarySchema.index({ userId: 1 });
// AccountSummarySchema.index({ accountNumber: 1 });

export default mongoose.model<IAccountSummary>('AccountSummary', AccountSummarySchema);