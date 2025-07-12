import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Add currency enum
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'] as const;
export type Currency = typeof CURRENCIES[number];

export interface IAccount {
  accountNumber: string;
  accountName: string;
  balance: number;
  currency: Currency;
  openedAt: Date;
}

export interface ICryptoWallet {
  walletAddress: string;
  currency: string;
  balance: number;
  label?: string;
  isBankManaged: boolean;
}

export interface ICard {
  cardId: string;
  lastFour: string;
  cardType: string;
  expiry: string;
  status: 'active' | 'locked' | 'lost';
}

export interface INotificationPreferences {
  accountActivity: boolean;
  promotions: boolean;
  securityAlerts: boolean;
}

export interface SecurityQuestion {
  question: string;
  answer: string;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profilePicture?: string; // Add this line
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  dateOfBirth: Date;
  country: string;
  state: string;
  address: string;
  phone: string;
  securityQuestions: SecurityQuestion[];
  accounts: IAccount[];
  cryptoWallets: ICryptoWallet[];
  cards: ICard[];
  rewardPoints: number;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isAdmin: boolean;
  status: 'active' | 'blocked';
  notificationPreferences?: INotificationPreferences; 
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const securityQuestionSchema = new mongoose.Schema<SecurityQuestion>({
  question: { 
    type: String, 
    required: [true, 'Security question is required'],
    trim: true
  },
  answer: { 
    type: String, 
    required: [true, 'Security answer is required'],
    trim: true
  }
}, { _id: false });

const accountSchema = new mongoose.Schema<IAccount>({
  accountNumber: { type: String, required: true },
  accountName: { type: String, required: true },
  balance: { type: Number, default: 0 },
  currency: { 
    type: String, 
    enum: CURRENCIES,
    default: 'USD',
    required: true 
  },
  openedAt: { type: Date, default: Date.now }
});

const cryptoWalletSchema = new mongoose.Schema<ICryptoWallet>({
  walletAddress: { type: String, required: true },
  currency: { type: String, required: true },
  balance: { type: Number, default: 0 },
  label: { type: String },
  isBankManaged: { type: Boolean, default: false }
});

const cardSchema = new mongoose.Schema<ICard>({
  cardId: { type: String, required: true },
  lastFour: { type: String, required: true },
  cardType: { type: String, enum: ['VISA', 'MASTERCARD'], required: true },
  expiry: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['active', 'locked', 'lost'],
    default: 'active'
  }
});

const notificationPreferencesSchema = new mongoose.Schema<INotificationPreferences>({
  accountActivity: { type: Boolean, default: true },
  promotions: { type: Boolean, default: false },
  securityAlerts: { type: Boolean, default: true }
}, { _id: false });

const userSchema = new mongoose.Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String }, // Add this line
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    required: true
  },
  dateOfBirth: { type: Date, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  securityQuestions: {
    type: [securityQuestionSchema],
    required: true,
    validate: {
      validator: function(questions: SecurityQuestion[]) {
        return questions && 
               questions.length >= 1 && 
               questions.every(q => q && q.question && q.question.trim() && q.answer && q.answer.trim());
      },
      message: 'At least one complete security question is required'
    }
  },
  accounts: [accountSchema],
  cryptoWallets: [cryptoWalletSchema],
  cards: [cardSchema],
  rewardPoints: { type: Number, default: 1000, min: 0 },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  isAdmin: { type: Boolean, required: true, default: false },
  status: { 
    type: String, 
    enum: ['active', 'blocked'],
    default: 'active'
  },
  notificationPreferences: { type: notificationPreferencesSchema, default: () => ({}) }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);