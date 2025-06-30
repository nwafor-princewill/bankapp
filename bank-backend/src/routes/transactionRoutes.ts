import { Router } from 'express';
import auth from '../middleware/auth';
import BankTransaction from '../models/BankTransaction';
import mongoose from 'mongoose';

const router = Router();

// Get transactions with pagination
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, startDate, endDate, accountNumber } = req.query;
    
    // Build query
    const query: any = { 
      userId: new mongoose.Types.ObjectId(req.user?.id) 
    };

    if (accountNumber) {
      query.accountNumber = accountNumber;
    }

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    // Get total count and paginated results
    const total = await BankTransaction.countDocuments(query);
    const transactions = await BankTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          limit: Number(limit)
        }
      }
    });

  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Create a new transaction
router.post('/', auth, async (req, res) => {
  try {
    const { accountNumber, amount, type, description, balanceAfter, recipientAccount, reference } = req.body;

    const transaction = await BankTransaction.create({
      userId: req.user?.id,
      accountNumber,
      amount,
      type,
      description,
      balanceAfter,
      recipientAccount,
      reference,
      status: 'completed'
    });

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

export default router;