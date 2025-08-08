import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import User, { CURRENCIES } from '../models/User';
import { generateAccountNumber, generateAccountName } from '../utils/accountUtils';

const router = Router();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD
  },
});

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

// @route   POST /api/auth/register
router.post('/register', async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  const { firstName, lastName, email, password, confirmPassword, gender, dateOfBirth, country, state, address, phone, securityQuestions, currency } = req.body;

  try {
    // Enhanced validation for all required fields
    const requiredFields = {
      firstName: 'First name',
      lastName: 'Last name', 
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password', // ADD THIS LINE
      gender: 'Gender',
      dateOfBirth: 'Date of birth',
      country: 'Country',
      state: 'State',
      address: 'Address',
      phone: 'Phone number',
      currency: 'Currency' // ADD THIS LINE TOO
    };

    // Check for missing required fields
    const missingFields = [];
    for (const [field, displayName] of Object.entries(requiredFields)) {
      if (!(req.body as any)[field] || (typeof (req.body as any)[field] === 'string' && (req.body as any)[field].trim() === '')) {
        missingFields.push(displayName);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `The following fields are required: ${missingFields.join(', ')}` 
      });
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
    if (!securityQuestions || 
        !Array.isArray(securityQuestions) ||
        securityQuestions.length < 1 || 
        !securityQuestions[0]?.question?.trim() || 
        !securityQuestions[0]?.answer?.trim()) {
      return res.status(400).json({ 
        message: 'At least one complete security question with answer is required' 
      });
    }

    // Check for duplicate security questions
    const duplicateQuestions = securityQuestions.filter((q, index) => 
      q.question && securityQuestions.findIndex(item => item.question === q.question) !== index
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
      securityQuestions: securityQuestions.map(q => ({
        question: q.question.trim(),
        answer: q.answer.trim()
      })),
      accounts: [{
        accountNumber,
        accountName,
        balance: 0.00,
        currency: currency as typeof CURRENCIES[number],
      }]
    });

    await user.save();

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

    // REMOVED: Check if user is blocked - now blocked users can login

    // Debug logging (remove in production)
    console.log('Login attempt for:', email);

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
        status: user.status // Include status so frontend knows if user is blocked
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

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry

    // Update only the reset fields without triggering full validation
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: new Date(resetTokenExpiry)
    });

    // user.resetPasswordToken = resetToken;
    // user.resetPasswordExpires = new Date(resetTokenExpiry);
    // await user.save();

    // Create reset URL
    // const resetUrl = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;

    // To this:
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL}/reset-password?token=${resetToken}`;

    // Send email
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Please click the link to reset your password:\n\n${resetUrl}\n\nThis link expires in 1 hour.`,
    };

    await transporter.sendMail(mailOptions);

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

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear token
    // user.password = newPassword;
    // user.resetPasswordToken = undefined;
    // user.resetPasswordExpires = undefined;
    // await user.save();

      // Update password and clear token fields without full validation
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      $unset: {
        resetPasswordToken: 1,
        resetPasswordExpires: 1
      }
    });

    // Send confirmation email
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: 'Password Changed',
      text: `Your password has been successfully changed.`
    };

    await transporter.sendMail(mailOptions);

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