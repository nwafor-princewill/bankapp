import { Router } from 'express';
import auth from '../middleware/auth';
import User from '../models/User';
import { check, validationResult } from 'express-validator';
import { Request, Response } from 'express';


const router = Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch profile' 
    });
  }
});

// Add to existing settingsRoutes.ts
router.get('/notifications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user?.id)
      .select('email notificationPreferences');
    res.json({
      email: user?.email,
      preferences: user?.notificationPreferences || {
        accountActivity: true,
        promotions: false,
        securityAlerts: true
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch settings' 
    });
  }
});

router.put('/notifications', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { notificationPreferences: req.body.preferences },
      { new: true }
    ).select('notificationPreferences');

    res.json({
      success: true,
      preferences: user?.notificationPreferences
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Update failed' 
    });
  }
});

// Update profile
router.put(
  '/profile',
  auth,
  [
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail()
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findByIdAndUpdate(
        req.user?.id,
        {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email
        },
        { new: true }
      ).select('-password');

      res.json({
        success: true,
        user
      });
    } catch (err) {
      res.status(500).json({ 
        success: false,
        message: 'Update failed' 
      });
    }
  }
);

// Update password
router.post('/security/password', auth, [
  check('currentPassword', 'Current password is required').notEmpty(),
  check('newPassword', 'Password must be 6+ characters').isLength({ min: 6 })
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.matchPassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = req.body.newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update security question
router.post('/security/question', auth, [
  check('question', 'Question is required').notEmpty(),
  check('answer', 'Answer is required').notEmpty()
], async (req: Request, res: Response) => {
  // Similar validation and update logic
});

export default router;