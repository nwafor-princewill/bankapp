import mongoose, { Document, Schema } from 'mongoose';

// This defines the shape of a single crypto transaction document
export interface ICryptoTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  walletAddress: string;
  txid: string;
  amount: number;
  confirmations: number;
  status: 'pending' | 'completed' | 'failed';
  type: 'receive' | 'send';
  timestamp: Date;
}

const CryptoTransactionSchema = new Schema<ICryptoTransaction>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  walletAddress: { 
    type: String, 
    required: true 
  },
  txid: { 
    type: String, 
    required: true, 
    unique: true // Each blockchain transaction ID should be unique
  },
  amount: { 
    type: Number, 
    required: true 
  },
  confirmations: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
    required: true
  },
  type: {
    type: String,
    enum: ['receive', 'send'],
    required: true
  },
  timestamp: { // The time the transaction was confirmed on the blockchain
    type: Date,
    required: true
  }
}, { 
  timestamps: true // Adds createdAt and updatedAt fields to our schema
});

// Add indexes for faster database queries
CryptoTransactionSchema.index({ userId: 1, timestamp: -1 });
CryptoTransactionSchema.index({ walletAddress: 1 });

export default mongoose.model<ICryptoTransaction>('CryptoTransaction', CryptoTransactionSchema);
