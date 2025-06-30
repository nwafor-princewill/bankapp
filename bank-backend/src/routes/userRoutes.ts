import { Router } from 'express';
import User from '../models/User';

const router = Router();

// @route   GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

export default router;