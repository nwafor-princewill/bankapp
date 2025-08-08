import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User';
import auth from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

const convertToBase64 = (file: Express.Multer.File): string => {
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
};

router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/:userId', auth, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/:userId/profile-picture', 
  auth, 
  upload.single('profilePicture'), 
  async (req: Request, res: Response) => {
    try {
      console.log('Profile picture upload started for user:', req.params.userId);
      
      const userId = req.params.userId;
      
      const user = await User.findById(userId);
      if (!user) {
        console.log('User not found:', userId);
        return res.status(404).json({ message: 'User not found' });
      }

      if (req.user?._id.toString() !== userId && !req.user?.isAdmin) {
        console.log('Unauthorized access attempt');
        return res.status(403).json({ message: 'You can only update your own profile picture' });
      }

      if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ message: 'No file uploaded' });
      }

      console.log('File details:', {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      const profilePictureUrl = convertToBase64(req.file);
      
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePicture: profilePictureUrl },
        { new: true, runValidators: false }
      );

      console.log('Profile picture updated successfully');

      res.json({
        message: 'Profile picture uploaded successfully',
        profilePictureUrl: profilePictureUrl
      });

    } catch (error) {
      console.error('Error uploading profile picture:', error);
      
      let errorMessage = 'Internal server error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      res.status(500).json({ 
        message: 'Server error during file upload',
        error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error'
      });
    }
});

router.delete('/:userId/profile-picture', 
  auth, 
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (req.user?._id.toString() !== userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: 'You can only delete your own profile picture' });
      }

      await User.findByIdAndUpdate(
        userId,
        { $unset: { profilePicture: 1 } },
        { runValidators: false }
      );

      res.json({ message: 'Profile picture deleted successfully' });

    } catch (error) {
      console.error('Error deleting profile picture:', error);
      res.status(500).json({ message: 'Server error during file deletion' });
    }
});

router.put('/:userId', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const updates = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user?._id.toString() !== userId && !req.user?.isAdmin) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    delete updates.password;
    delete updates.isAdmin;
    delete updates.accounts;
    delete updates.cryptoWallets;
    delete updates.cards;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error during user update' });
  }
});

/* // ====== REMOVED PIN ROUTES ======
router.get('/pin-status', auth, async (req: Request, res: Response) => {
  try {
    console.log('Checking PIN status for user:', req.user?._id);
    
    const user = await User.findById(req.user?._id).select('transferPinSet transferPinCreatedAt');
    if (!user) {
      console.log('User not found during PIN status check');
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    const hasPin = Boolean(user.transferPinSet);
    console.log('PIN status result:', { hasPin, transferPinSet: user.transferPinSet });
    
    res.json({
      success: true,
      hasPin: hasPin
    });
  } catch (err) {
    console.error('Error checking PIN status:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.post('/set-pin', auth, async (req: Request, res: Response) => {
  try {
    const { pin } = req.body;
    
    console.log('Setting PIN for user:', req.user?._id);
    
    if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: 'PIN must be 4 digits'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);

    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
        transferPin: hashedPin,
        transferPinSet: true,
        transferPinCreatedAt: new Date()
      },
      { 
        new: true, 
        runValidators: false
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('PIN set successfully for user:', req.user?._id, { transferPinSet: updatedUser.transferPinSet });

    res.json({
      success: true,
      message: 'Transfer PIN set successfully'
    });
  } catch (err) {
    console.error('Error setting PIN:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to set PIN'
    });
  }
});

router.post('/verify-pin', auth, async (req: Request, res: Response) => {
  try {
    const { pin } = req.body;
    const user = await User.findById(req.user?._id).select('+transferPin transferPinSet');
    
    if (!user?.transferPin || !user?.transferPinSet) {
      return res.status(400).json({
        success: false,
        message: 'No transfer PIN set'
      });
    }

    const isMatch = await bcrypt.compare(pin, user.transferPin);
    res.json({
      success: isMatch,
      message: isMatch ? 'PIN verified' : 'Invalid PIN'
    });
  } catch (err) {
    console.error('Error verifying PIN:', err);
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
});
// ====== END OF REMOVED PIN ROUTES ====== */

export default router;