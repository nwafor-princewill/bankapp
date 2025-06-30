import mongoose, { Document } from 'mongoose';

interface IServiceRequest extends Document {
  userId: mongoose.Types.ObjectId;
  requestType: string;
  details: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const ServiceRequestSchema = new mongoose.Schema<IServiceRequest>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestType: { type: String, required: true },
  details: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'resolved'],
    default: 'open'
  }
}, { timestamps: true });

export default mongoose.model<IServiceRequest>('ServiceRequest', ServiceRequestSchema);