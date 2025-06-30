
// bank-backend/src/middleware/isAdmin.ts
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Admin middleware triggered');
    console.log('req.user:', req.user);
    
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      console.log('No userId found in request');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    console.log('Looking for user with ID:', userId);
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User found:', user.email, 'isAdmin:', user.isAdmin);
    
    if (!user.isAdmin) {
      console.log('User is not admin');
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    console.log('Admin access granted');
    req.user = user;
    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};