import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { generateAccountNumber, generateAccountName } from '../utils/accountUtils';

const router = Router();

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

// @route   POST /api/auth/register
router.post('/register', async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  try {
        // Add validation
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const accountNumber = generateAccountNumber();
    const accountName = generateAccountName(firstName, lastName);

    user = new User({
      firstName,
      lastName,
      email,
      password,
      accounts: [{
        accountNumber,
        accountName,
        balance: 1000.00,
        currency: 'USD',
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
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

        // Debug logging
    console.log('Stored hash:', user.password);
    console.log('Input password:', req.body.password);

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
        accounts: user.accounts
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


// Add to your authRoutes.ts
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
    res.status(500).send('Server error');
  }
});

export default router;