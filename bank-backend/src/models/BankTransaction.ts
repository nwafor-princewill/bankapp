import mongoose, { Document } from 'mongoose';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  PAYMENT = 'payment'
}

// Enum for transfer types
export enum TransferType {
  INTERNAL = 'internal',
  DOMESTIC = 'domestic',
  INTERNATIONAL = 'international'
}

interface ModificationHistoryItem {
  date: Date;
  changedBy: mongoose.Types.ObjectId;
  changes: Record<string, any>;
}

interface IBankTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  accountNumber: string;
  amount: number;
  currency: string; // Add this
  type: TransactionType;
  transferType?: TransferType; // Add this line
  recipientDetails?: RecipientDetails; // Optional field
  description: string;
  balanceAfter: number;
  recipientAccount?: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  originalDate?: Date;
  lastModifiedBy?: mongoose.Types.ObjectId;
  modificationHistory?: ModificationHistoryItem[];
}

// Add to your existing IBankTransaction interface
interface RecipientDetails {
  accountName?: string;
  bankName?: string;
  bankAddress?: string;
  swiftIban?: string;
  email?: string;
  phone?: string;
}

const BankTransactionSchema = new mongoose.Schema<IBankTransaction>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  accountNumber: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String,
    default: 'USD'
  },
  type: { 
    type: String, 
    enum: Object.values(TransactionType),
    required: true 
  },
  // Add transferType field

  transferType: {
    type: String,
    enum: Object.values(TransferType),
    required: false
  },

  recipientDetails: {
    type: {
      accountName: String,
      bankName: String,
      bankAddress: String,
      swiftIban: String,
      email: String,
      phone: String
    },
    required: false,
    _id: false // Prevent automatic ID generation for subdocuments
  },
  
  description: { 
    type: String, 
    required: true 
  },
  balanceAfter: { 
    type: Number, 
    required: true 
  },
  recipientAccount: { 
    type: String 
  },
  reference: { 
    type: String, 
    required: true, 
    unique: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'],
    default: 'completed' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  originalDate: { 
    type: Date 
  },
  lastModifiedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  modificationHistory: [{
    date: { 
      type: Date, 
      default: Date.now 
    },
    changedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    changes: { 
      type: Object,
      required: true
    }
  }]
}, {
  toJSON: { 
    virtuals: true,
    transform: function (doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  toObject: { 
    virtuals: true 
  }
});

// Add pre-save hook to track changes
BankTransactionSchema.pre<IBankTransaction>('save', function(next) {
  const transaction = this;

  // Always update the updatedAt field
  transaction.updatedAt = new Date();

  // If we're changing createdAt (backdating), track the modification
  if (transaction.isModified('createdAt') && !transaction.isNew) {
    const changes = {
      createdAt: {
        from: transaction.get('createdAt', null, { getters: false }),
        to: transaction.createdAt
      }
    };

    // Initialize modificationHistory if it doesn't exist
    if (!transaction.modificationHistory) {
      transaction.modificationHistory = [];
    }

    // Add the modification record
    transaction.modificationHistory.push({
      date: new Date(),
      changedBy: transaction.lastModifiedBy || transaction.userId,
      changes
    });
  }

  // If this is a new transaction, set originalDate
  if (transaction.isNew && !transaction.originalDate) {
    transaction.originalDate = transaction.createdAt;
  }

  next();
});

// Indexes for optimized queries
BankTransactionSchema.index({ userId: 1, createdAt: -1 });
BankTransactionSchema.index({ accountNumber: 1, createdAt: -1 });
BankTransactionSchema.index({ reference: 1 });
BankTransactionSchema.index({ status: 1, createdAt: -1 });

// Virtual for formatted createdAt date
BankTransactionSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleString();
});

// Static method for finding transactions by user
BankTransactionSchema.statics.findByUserId = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Instance method for backdating
BankTransactionSchema.methods.backdateTransaction = function(
  newDate: Date, 
  modifiedBy: mongoose.Types.ObjectId
) {
  if (newDate > new Date()) {
    throw new Error('Cannot backdate to a future date');
  }

  if (!this.originalDate) {
    this.originalDate = this.createdAt;
  }

  this.lastModifiedBy = modifiedBy;
  this.createdAt = newDate;
  return this.save();
};

const BankTransaction = mongoose.model<IBankTransaction>(
  'BankTransaction', 
  BankTransactionSchema
);

export default BankTransaction;