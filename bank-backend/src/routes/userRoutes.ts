import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User';
import auth from '../middleware/auth'; // Your existing auth middleware

const router = Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads', 'profile-pictures');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId-timestamp.extension
    const userId = req.params.userId || 'unknown';
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${userId}-${timestamp}${extension}`);
  }
});

// File filter to only allow images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// @route   GET /api/users
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/users/:userId
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

// @route   POST /api/users/:userId/profile-picture
// @desc    Upload profile picture
// @access  Private
router.post('/:userId/profile-picture', 
  auth, 
  upload.single('profilePicture'), 
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user is updating their own profile (optional security check)
      if (req.user?._id.toString() !== userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: 'You can only update your own profile picture' });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Delete old profile picture if exists
      if (user.profilePicture) {
        const oldImagePath = path.join(__dirname, '..', user.profilePicture);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Update user with new profile picture path
      const profilePicturePath = `uploads/profile-pictures/${req.file.filename}`;
      user.profilePicture = profilePicturePath;
      await user.save();

      // Return the full URL for the profile picture
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      const profilePictureUrl = `${baseUrl}/${profilePicturePath}`;

      res.json({
        message: 'Profile picture uploaded successfully',
        profilePictureUrl: profilePictureUrl,
        profilePicturePath: profilePicturePath
      });

    } catch (error) {
      console.error('Error uploading profile picture:', error);
      
      // Delete uploaded file if there was an error
      if (req.file) {
        const filePath = path.join(uploadDir, req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      res.status(500).json({ message: 'Server error during file upload' });
    }
  }
);

// @route   DELETE /api/users/:userId/profile-picture
// @desc    Delete profile picture
// @access  Private
router.delete('/:userId/profile-picture', 
  auth, 
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user is updating their own profile
      if (req.user?._id.toString() !== userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: 'You can only delete your own profile picture' });
      }

      // Delete the file if it exists
      if (user.profilePicture) {
        const imagePath = path.join(__dirname, '..', user.profilePicture);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Remove profile picture from user record
      user.profilePicture = undefined;
      await user.save();

      res.json({ message: 'Profile picture deleted successfully' });

    } catch (error) {
      console.error('Error deleting profile picture:', error);
      res.status(500).json({ message: 'Server error during file deletion' });
    }
  }
);

// @route   PUT /api/users/:userId
// @desc    Update user profile
// @access  Private
router.put('/:userId', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const updates = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is updating their own profile
    if (req.user?._id.toString() !== userId && !req.user?.isAdmin) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    // Remove sensitive fields from updates
    delete updates.password;
    delete updates.isAdmin;
    delete updates.accounts;
    delete updates.cryptoWallets;
    delete updates.cards;

    // Update user
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

export default router;