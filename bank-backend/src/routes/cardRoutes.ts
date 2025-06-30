import { Router } from 'express';
import auth from '../middleware/auth';
import User from '../models/User';

const router = Router();

// Get user's cards
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select('cards');
    res.json(user?.cards || []);
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch cards' 
    });
  }
});

// Lock/unlock card
router.post('/:cardId/lock', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user?.id);
    const card = user?.cards.find(c => c.cardId === req.params.cardId);
    
    if (!card) {
      return res.status(404).json({ 
        success: false,
        message: 'Card not found' 
      });
    }

    card.status = card.status === 'active' ? 'locked' : 'active';
    await user?.save();

    res.json({ 
      success: true,
      status: card.status
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to update card' 
    });
  }
});

export default router;