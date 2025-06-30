// import mongoose from 'mongoose';
// import dotenv from 'dotenv';

// dotenv.config();

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI!);
//     console.log('MongoDB Connected...');
//   } catch (err) {
//     console.error('Database connection error:', err);
//     process.exit(1);
//   }
// };

// export default connectDB;

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI; // Changed from MONGO_URI
    if (!uri) throw new Error("MONGODB_URI not found in environment variables");
    
    await mongoose.connect(uri);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
};

export default connectDB;