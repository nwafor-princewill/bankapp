import mongoose, { Document } from 'mongoose';

export enum ProductType {
  LOAN = 'loan',
  INVESTMENT = 'investment',
  SERVICE = 'service'
}

interface ILoanProduct extends Document {
  name: string;
  type: ProductType;
  description: string;
  interestRate?: number;
  minAmount: number;
  maxAmount: number;
  term: string;
  features: string[];
  eligibility: string[];
}

const LoanProductSchema = new mongoose.Schema<ILoanProduct>({
  name: { type: String, required: true },
  type: { type: String, enum: Object.values(ProductType), required: true },
  description: { type: String, required: true },
  interestRate: { type: Number },
  minAmount: { type: Number, default: 0 },
  maxAmount: { type: Number },
  term: { type: String },
  features: { type: [String], default: [] },
  eligibility: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model<ILoanProduct>('LoanProduct', LoanProductSchema);