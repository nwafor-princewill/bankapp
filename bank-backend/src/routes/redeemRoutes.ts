import { Router } from 'express';
import auth from '../middleware/auth';
import User from '../models/User';

const router = Router();

// Get user's points balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select('rewardPoints');
    res.json({ 
      balance: user?.rewardPoints || 0 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch balance' 
    });
  }
});

// Redeem points
router.post('/', auth, async (req, res) => {
  const { amount, reward } = req.body;
  
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Simple validation
    if (user.rewardPoints < amount) {
      return res.status(400).json({ 
        success: false,
        message: 'Insufficient points' 
      });
    }

    // Update balance
    user.rewardPoints -= amount;
    await user.save();

    // In production: Create redemption record here
    
    res.json({ 
      success: true,
      newBalance: user.rewardPoints,
      message: `Redeemed ${amount} points for ${reward}`
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Redemption failed' 
    });
  }
});

export default router;