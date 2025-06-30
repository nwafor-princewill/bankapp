import { Router } from 'express';
import auth from '../middleware/auth';
import LoanProduct from '../models/LoanProduct';

const router = Router();

// Get all products
router.get('/', auth, async (req, res) => {
  try {
    const products = await LoanProduct.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply for product
router.post('/apply', auth, async (req, res) => {
  try {
    const { productId, amount, term } = req.body;
    
    // In a real app, you would:
    // 1. Validate application
    // 2. Check eligibility
    // 3. Create application record
    
    res.json({ 
      success: true,
      message: 'Application received',
      application: {
        productId,
        amount,
        term,
        status: 'under_review',
        reference: `APP-${Date.now()}`
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Application failed' });
  }
});

export default router;