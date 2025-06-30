import mongoose, { Document } from 'mongoose';

interface IAccountMaintenance extends Document {
  userId: mongoose.Types.ObjectId;
  accountNumber: string;
  requestType: string;
  details: string;
  status: 'submitted' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const AccountMaintenanceSchema = new mongoose.Schema<IAccountMaintenance>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountNumber: { type: String, required: true },
  requestType: { type: String, required: true },
  details: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['submitted', 'in_progress', 'completed'],
    default: 'submitted'
  }
}, { timestamps: true });

export default mongoose.model<IAccountMaintenance>('AccountMaintenance', AccountMaintenanceSchema);