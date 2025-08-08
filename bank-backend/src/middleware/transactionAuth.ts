// src/middleware/transactionAuth.ts

import { Request, Response, NextFunction } from 'express';

const transactionAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated (this should run after the auth middleware)
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required.' 
      });
    }

    // Check if user account is blocked
    if (req.user.status === 'blocked') {
      return res.status(403).json({ 
        success: false,
        message: 'You cannot make any transactions because your account has been blocked. Please contact our team through live chat or email us at support@ZenaTrust bank.com for assistance.',
        errorType: 'ACCOUNT_BLOCKED'
      });
    }

    next();
  } catch (err) {
    console.error('Transaction auth error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

export default transactionAuth;