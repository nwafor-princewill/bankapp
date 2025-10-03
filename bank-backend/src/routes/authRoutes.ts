import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User, { CURRENCIES, ID_TYPES } from '../models/User';
import { generateAccountNumber, generateAccountName } from '../utils/accountUtils';
import { sendTransferOtpEmail, sendEmail } from '../utils/emailService';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import pdfParse from 'pdf-parse';
import fs from 'fs/promises';
import EmailVerification from '../models/EmailVerification';

const router = Router();

// Set up multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/ids'); // Folder to store ID documents
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
//   },
// });

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'ids');
    
    try {
      // Check if path exists
      try {
        const stats = await fs.stat(uploadDir);
        
        // If it's a file (not a directory), remove it
        if (!stats.isDirectory()) {
          console.log('Removing file that should be a directory:', uploadDir);
          await fs.unlink(uploadDir);
          await fs.mkdir(uploadDir, { recursive: true });
        }
      } catch (err: any) {
        // Path doesn't exist, create it
        if (err.code === 'ENOENT') {
          console.log('Creating upload directory:', uploadDir);
          await fs.mkdir(uploadDir, { recursive: true });
        } else {
          throw err;
        }
      }
      
      cb(null, uploadDir);
    } catch (err) {
      console.error('Directory creation error:', err);
      cb(err as Error, '');
    }
  },
  filename: (req, file, cb) => {
    // Sanitize filename to avoid issues
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${sanitizedName}`);
  },
});


const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: async (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.pdf'].includes(ext)) {
      return cb(new Error('Invalid file type. Only JPG, PNG, PDF allowed.'));
    }
    cb(null, true);
  },
});

// Validate file content
const validateFileContent = async (file: Express.Multer.File): Promise<boolean> => {
  try {
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Check if file exists
    try {
      await fs.access(file.path);
    } catch {
      throw new Error('Uploaded file not found or inaccessible');
    }
    
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      // Validate image with sharp
      try {
        const metadata = await sharp(file.path).metadata();
        if (!metadata.width || !metadata.height) {
          throw new Error('Invalid image file');
        }
        if (metadata.width < 300 || metadata.height < 300) {
          throw new Error('Image resolution too low (minimum 300x300)');
        }
      } catch (sharpErr) {
        throw new Error('Invalid or corrupted image file');
      }
      return true;
    } else if (ext === '.pdf') {
      // Validate PDF with pdf-parse
      try {
        const data = await fs.readFile(file.path);
        const pdfData = await pdfParse(data);
        if (!pdfData.text || !pdfData.text.trim()) {
          throw new Error('PDF contains no readable text');
        }
      } catch (pdfErr) {
        throw new Error('Invalid or corrupted PDF file');
      }
      return true;
    }
    
    throw new Error('Unsupported file type');
  } catch (err) {
    // Always try to clean up the file
    try {
      await fs.unlink(file.path);
    } catch (unlinkErr) {
      console.error('Error deleting file during validation:', unlinkErr);
    }
    throw err instanceof Error ? err : new Error('Invalid file content');
  }
};

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
  dateOfBirth: string;
  country: string;
  state: string;
  address: string;
  phone: string;
  securityQuestions: Array<{
    question: string;
    answer: string;
  }>;
  currency: string;
  otp: string;
  idType: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

interface SendOtpRequest {
  email: string;
  firstName: string;
}

// In-memory OTP store (for simplicity; use Redis or DB in production)
// const otpStore: { [email: string]: { otp: string; expires: number } } = {};

// @route   POST /api/auth/send-otp
// router.post('/send-otp', async (req: Request<{}, {}, SendOtpRequest>, res: Response) => {
//   const { email, firstName } = req.body;

//   try {
//     if (!email || !firstName) {
//       return res.status(400).json({ message: 'Email and first name are required' });
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ message: 'Please enter a valid email address' });
//     }

//     const user = await User.findOne({ email: email.toLowerCase() });
//     if (user) {
//       return res.status(400).json({ message: 'Email already exists' });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
//     const expires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

//     otpStore[email.toLowerCase()] = { otp, expires };

//     const emailSent = await sendTransferOtpEmail({ email, firstName, otp }, 'signup');
//     if (!emailSent) {
//       throw new Error('Failed to send OTP email');
//     }

//     res.json({ message: 'OTP sent successfully' });
//   } catch (err) {
//     console.error('Send OTP error:', err);
//     res.status(500).json({ message: 'Failed to send OTP' });
//   }
// });


// @route   POST /api/auth/send-otp
router.post('/send-otp', async (req: Request<{}, {}, SendOtpRequest>, res: Response) => {
  const { email, firstName } = req.body;

  try {
    if (!email || !firstName) {
      return res.status(400).json({ message: 'Email and first name are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Check if user already exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in separate collection (upsert to replace any existing OTP)
    await EmailVerification.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        email: email.toLowerCase(),
        otp,
        firstName,
        expiresAt
      },
      { upsert: true, new: true }
    );

    console.log('OTP generated for', email, ':', otp);
    console.log('OTP expires at:', expiresAt);

    const emailSent = await sendTransferOtpEmail({ email, firstName, otp }, 'signup');
    if (!emailSent) {
      throw new Error('Failed to send OTP email');
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// @route   POST /api/auth/register
router.post('/register', upload.single('idDocument'), async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  console.log('=== Registration Request Received ===');
  console.log('Body fields:', Object.keys(req.body));
  console.log('File received:', req.file ? {
    fieldname: req.file.fieldname,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  } : 'NO FILE');
  console.log('===================================');

  const { firstName, lastName, email, password, confirmPassword, gender, dateOfBirth, country, state, address, phone, securityQuestions, currency, otp, idType } = req.body;
  const idDocument = req.file;

  try {
    // Parse securityQuestions if it's a string
    let parsedSecurityQuestions = securityQuestions;
    if (typeof securityQuestions === 'string') {
      try {
        parsedSecurityQuestions = JSON.parse(securityQuestions);
      } catch (parseErr) {
        console.error('Error parsing security questions:', parseErr);
        return res.status(400).json({ message: 'Invalid security questions format' });
      }
    }

    // Validate OTP
    const verification = await EmailVerification.findOne({ 
      email: email.toLowerCase() 
    });

    console.log('Checking OTP for email:', email.toLowerCase());
    console.log('Submitted OTP:', otp);
    console.log('Stored OTP:', verification?.otp);

    if (!verification || 
        verification.otp !== otp || 
        verification.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Enhanced validation for all required fields
    const requiredFields = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      gender: 'Gender',
      dateOfBirth: 'Date of birth',
      country: 'Country',
      state: 'State',
      address: 'Address',
      phone: 'Phone number',
      currency: 'Currency',
      otp: 'OTP',
      idType: 'ID type'
    };

    // Check for missing required fields
    const missingFields = [];
    for (const [field, displayName] of Object.entries(requiredFields)) {
      if (!(req.body as any)[field] || (typeof (req.body as any)[field] === 'string' && (req.body as any)[field].trim() === '')) {
        missingFields.push(displayName);
      }
    }

    if (!idDocument) {
      console.error('No ID document file received');
      missingFields.push('ID document');
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `The following fields are required: ${missingFields.join(', ')}`
      });
    }

    // Rest of your validation code...
    // (continue with the existing validation)

    // Check for empty or too small file
    if (!idDocument || idDocument.size === 0) {
      return res.status(400).json({ message: 'Uploaded ID document is empty' });
    }
    if (idDocument.size < 1024) {
      await fs.unlink(idDocument.path);
      return res.status(400).json({ message: 'Uploaded ID document is too small' });
    }

    // Validate file content
    try {
    await validateFileContent(idDocument);
  } catch (err) {
    // Ensure file is deleted even if validation fails
    try {
      await fs.unlink(idDocument.path);
    } catch (unlinkErr) {
      console.error('Error deleting invalid file:', unlinkErr);
    }
    return res.status(400).json({ 
      message: err instanceof Error ? err.message : 'Uploaded file is corrupted or invalid' 
    });
  }


    // ID type validation
    if (!ID_TYPES.includes(idType as any)) {
      return res.status(400).json({ message: 'Invalid ID type. Must be passport, national_id, or drivers_license' });
    }

    // Password validation
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Currency validation
    if (!CURRENCIES.includes(currency as any)) {
      return res.status(400).json({ message: 'Invalid currency selection' });
    }

    // Security questions validation
    // if (!securityQuestions ||
    //     !Array.isArray(securityQuestions) ||
    //     securityQuestions.length < 1 ||
    //     !securityQuestions[0]?.question?.trim() ||
    //     !securityQuestions[0]?.answer?.trim()) {
    //   return res.status(400).json({
    //     message: 'At least one complete security question with answer is required'
    //   });
    // }

    // Security questions validation - use the PARSED version
    if (!parsedSecurityQuestions ||
        !Array.isArray(parsedSecurityQuestions) ||
        parsedSecurityQuestions.length < 1 ||
        !parsedSecurityQuestions[0]?.question?.trim() ||
        !parsedSecurityQuestions[0]?.answer?.trim()) {
      return res.status(400).json({
        message: 'At least one complete security question with answer is required'
      });
    }

    // Check for duplicate security questions
    // const duplicateQuestions = securityQuestions.filter((q, index) =>
    //   q.question && securityQuestions.findIndex(item => item.question === q.question) !== index
    // );

    // Check for duplicate security questions - use the PARSED version
    const duplicateQuestions = parsedSecurityQuestions.filter((q, index) =>
      q.question && parsedSecurityQuestions.findIndex(item => item.question === q.question) !== index
    );

    if (duplicateQuestions.length > 0) {
      return res.status(400).json({ message: 'Please select different security questions' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate account details
    const accountNumber = generateAccountNumber();
    const accountName = generateAccountName(firstName, lastName);

    // Create new user
    user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      gender,
      dateOfBirth: new Date(dateOfBirth),
      country: country.trim(),
      state: state.trim(),
      address: address.trim(),
      phone: phone.trim(),
      // securityQuestions: securityQuestions.map(q => ({
      //   question: q.question.trim(),
      //   answer: q.answer.trim()
      // })),
      securityQuestions: parsedSecurityQuestions.map(q => ({
        question: q.question.trim(),
        answer: q.answer.trim()
      })),
      accounts: [{
        accountNumber,
        accountName,
        balance: 0.00,
        currency: currency as typeof CURRENCIES[number],
      }],
      idType,
      idDocumentPath: idDocument.path,
    });

    await user.save();

    // Clear OTP after successful registration
    // delete otpStore[email.toLowerCase()];

    // Clear OTP after successful registration
    // await User.findOneAndUpdate(
    //   { email: email.toLowerCase() },
    //   {
    //     $unset: {
    //       emailVerificationOtp: 1,
    //       emailVerificationOtpExpires: 1
    //     }
    //   }
    // );

    // Clear OTP after successful registration
    await EmailVerification.findOneAndDelete({ email: email.toLowerCase() });

    // Verify JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accounts: user.accounts
      }
    });
  } catch (err) {
    console.error('Registration error:', err);

    // Handle mongoose validation errors
    if (typeof err === 'object' && err !== null && 'name' in err && (err as any).name === 'ValidationError') {
      const errors = Object.values((err as any).errors).map((error: any) => error.message);
      return res.status(400).json({ message: errors.join(', ') });
    }

    // Handle duplicate key errors
    if (typeof err === 'object' && err !== null && 'code' in err && (err as any).code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Handle multer errors
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds 5MB limit' });
      }
      return res.status(400).json({ message: err.message });
    }

    if (err instanceof Error && err.message.includes('Invalid file type')) {
      return res.status(400).json({ message: err.message });
    }

    if (err instanceof Error && (err.message.includes('Image resolution too low') || err.message.includes('PDF contains no readable text'))) {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  const { email, password } = req.body;

  try {
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accounts: user.accounts,
        isAdmin: user.isAdmin,
        status: user.status
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request<{}, {}, ForgotPasswordRequest>, res: Response) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ success: true, message: 'If an account exists, you will receive a reset email' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry

    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: new Date(resetTokenExpiry)
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL}/reset-password?token=${resetToken}`;

    const emailSent = await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Please click the link to reset your password:\n\n${resetUrl}\n\nThis link expires in 1 hour.`,
    });

    if (!emailSent.success) {
      throw new Error('Failed to send reset email');
    }

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Error processing request' });
  }
});

// @route   POST /api/auth/reset-password
router.post('/reset-password', async (req: Request<{}, {}, ResetPasswordRequest>, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      $unset: {
        resetPasswordToken: 1,
        resetPasswordExpires: 1
      }
    });

    const emailSent = await sendEmail({
      to: user.email,
      subject: 'Password Changed',
      text: `Your password has been successfully changed.`,
    });

    if (!emailSent.success) {
      throw new Error('Failed to send confirmation email');
    }

    res.json({ success: true, message: 'Password updated successfully', redirectTo: '/' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Error resetting password' });
  }
});

// @route   GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Auth verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;