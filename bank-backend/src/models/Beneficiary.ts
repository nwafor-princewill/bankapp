import mongoose, { Document } from 'mongoose';

interface IBeneficiary extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  accountNumber: string;
  bankName: string;
  email?: string;
  phone?: string;
  nickname?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BeneficiarySchema = new mongoose.Schema<IBeneficiary>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  accountNumber: { type: String, required: true },
  bankName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  nickname: { type: String }
}, { timestamps: true });

export default mongoose.model<IBeneficiary>('Beneficiary', BeneficiarySchema);