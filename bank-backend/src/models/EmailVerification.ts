import mongoose, { Document } from 'mongoose';

export interface IEmailVerification extends Document {
  email: string;
  otp: string;
  firstName: string;
  expiresAt: Date;
  createdAt: Date;
}

const emailVerificationSchema = new mongoose.Schema<IEmailVerification>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index - MongoDB will auto-delete expired documents
  }
}, {
  timestamps: true
});

// Ensure only one active OTP per email
emailVerificationSchema.index({ email: 1 }, { unique: true });

export default mongoose.model<IEmailVerification>('EmailVerification', emailVerificationSchema);