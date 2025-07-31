// routes/loanroutes.ts
import { Router, Request, Response } from 'express';
import auth from '../middleware/auth';
import LoanProduct from '../models/LoanProduct';
import LoanApplication from '../models/LoanApplication';
import User from '../models/User';
import { sendLoanApplicationEmail } from '../utils/emailService';

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

const router = Router();

// Get all products
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const products = await LoanProduct.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply for loan
router.post('/apply', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, term, employmentType, purpose, customPurpose } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get user information
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate unique application ID
    const applicationId = `LOAN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create loan application
    const loanApplication = new LoanApplication({
      userId,
      applicationId,
      amount: parseFloat(amount),
      term: parseInt(term),
      employmentType,
      purpose,
      customPurpose: purpose === 'other' ? customPurpose : undefined,
      status: 'pending'
    });

    await loanApplication.save();

    // Prepare email data
    const emailData = {
      userInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      },
      loanDetails: {
        amount,
        term,
        employmentType,
        purpose,
        customPurpose
      },
      applicationId
    };

    // Send email to bank
    const emailSent = await sendLoanApplicationEmail(emailData);

    res.json({
      success: true,
      message: 'Loan application submitted successfully',
      application: {
        applicationId,
        amount: parseFloat(amount),
        term: parseInt(term),
        employmentType,
        purpose,
        status: 'pending',
        submittedAt: loanApplication.submittedAt
      },
      emailSent
    });

  } catch (err) {
    console.error('Loan application error:', err);
    res.status(500).json({ message: 'Application failed' });
  }
});

// Get user's loan applications
router.get('/my-applications', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const applications = await LoanApplication.find({ userId })
      .sort({ submittedAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error('Error fetching loan applications:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific loan application
router.get('/application/:applicationId', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user?.id;

    const application = await LoanApplication.findOne({ 
      applicationId, 
      userId 
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (err) {
    console.error('Error fetching loan application:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;