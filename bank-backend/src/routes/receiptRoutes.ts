import { Router } from 'express';
import auth from '../middleware/auth';
import Receipt from '../models/receipt';

const router = Router();

// Get receipt for a transaction
router.get('/:reference', auth, async (req, res) => {  // Changed from transactionId to reference
  try {
    const receipt = await Receipt.findOne({ 
      reference: req.params.reference,  // Changed from transactionId to reference
      userId: req.user?.id 
    });

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