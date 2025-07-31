// models/LoanApplication.ts
import mongoose, { Document } from 'mongoose';

export interface ILoanApplication extends Document {
  userId: mongoose.Types.ObjectId;
  applicationId: string;
  amount: number;
  term: number; // in months
  employmentType: 'full-time' | 'part-time' | 'self-employed' | 'unemployed';
  purpose: string;
  customPurpose?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  notes?: string;
}

const loanApplicationSchema = new mongoose.Schema<ILoanApplication>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    min: 100
  },
  term: {
    type: Number,
    required: true,
    enum: [6, 12, 24, 36, 60]
  },
  employmentType: {
    type: String,
    required: true,
    enum: ['full-time', 'part-time', 'self-employed', 'unemployed']
  },
  purpose: {
    type: String,
    required: true
  },
  customPurpose: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model<ILoanApplication>('LoanApplication', loanApplicationSchema);