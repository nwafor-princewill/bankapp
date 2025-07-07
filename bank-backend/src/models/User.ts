import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAccount {
  accountNumber: string;
  accountName: string;
  balance: number;
  currency: string;
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

// **FIX 1:** Define the shape of the notification preferences
export interface INotificationPreferences {
  accountActivity: boolean;
  promotions: boolean;
  securityAlerts: boolean;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  accounts: IAccount[];
  cryptoWallets: ICryptoWallet[];
  cards: ICard[];
  rewardPoints: number;
  isAdmin: boolean;
  status: 'active' | 'blocked'; // Add this line
  notificationPreferences?: INotificationPreferences; 
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const accountSchema = new mongoose.Schema<IAccount>({
  accountNumber: { type: String, required: true },
  accountName: { type: String, required: true },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
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

// **FIX 3:** Define the schema for the notification preferences
const notificationPreferencesSchema = new mongoose.Schema<INotificationPreferences>({
  accountActivity: { type: Boolean, default: true },
  promotions: { type: Boolean, default: false },
  securityAlerts: { type: Boolean, default: true }
}, { _id: false }); // Use _id: false as it's a subdocument

const userSchema = new mongoose.Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accounts: [accountSchema],
  cryptoWallets: [cryptoWalletSchema],
  cards: [cardSchema],
  rewardPoints: { type: Number, default: 1000, min: 0 },
  isAdmin: { type: Boolean, required: true, default: false },
  status: { 
    type: String, 
    enum: ['active', 'blocked'],
    default: 'active'
  }, // Add this field
  notificationPreferences: { type: notificationPreferencesSchema, default: () => ({}) }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);