import { Router } from 'express';
import auth from '../middleware/auth';
import Receipt from '../models/receipt';
import BankTransaction from '../models/BankTransaction';

const router = Router();

// Get receipt for a transaction
router.get('/:transactionId', auth, async (req, res) => {
  try {
    const receipt = await Receipt.findOne({ 
      transactionId: req.params.transactionId,
      userId: req.user?.id 
    }).populate('transactionId');

    if (!receipt) {
      return res.status(404).json({ 
        success: false,
        message: 'Receipt not found' 
      });
    }

    res.json({
      success: true,
      data: receipt
    });
  } catch (err) {
    console.error('Receipt error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch receipt' 
    });
  }
});

export default router;