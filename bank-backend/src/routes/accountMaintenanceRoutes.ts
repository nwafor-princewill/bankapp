import { Router } from 'express';
import auth from '../middleware/auth';
import AccountMaintenance from '../models/AccountMaintenance'; // Ensure this model is defined correctly

const router = Router();

// Submit maintenance request
router.post('/', auth, async (req, res) => {
  try {
    const { accountNumber, requestType, details } = req.body;
    
    const request = new AccountMaintenance({
      userId: req.user?.id,
      accountNumber,
      requestType,
      details,
      status: 'submitted'
    });

    await request.save();
    
    res.status(201).json({
      success: true,
      request,
      message: 'Maintenance request submitted'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Request failed'
    });
  }
});

export default router;