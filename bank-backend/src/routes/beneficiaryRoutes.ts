import { Router } from 'express';
import auth from '../middleware/auth';
import Beneficiary from '../models/Beneficiary';

const router = Router();

// Get all beneficiaries
router.get('/', auth, async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.find({ userId: req.user?.id });
    res.json(beneficiaries);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new beneficiary
router.post('/', auth, async (req, res) => {
  try {
    const { name, accountNumber, bankName, email, phone, nickname } = req.body;
    
    const beneficiary = new Beneficiary({
      userId: req.user?.id,
      name,
      accountNumber,
      bankName,
      email,
      phone,
      nickname
    });

    await beneficiary.save();
    res.status(201).json(beneficiary);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete beneficiary
router.delete('/:id', auth, async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!beneficiary) {
      return res.status(404).json({ message: 'Beneficiary not found' });
    }

    res.json({ message: 'Beneficiary deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;