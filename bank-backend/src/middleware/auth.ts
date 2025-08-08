// src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).send({ error: 'Authentication required. No token provided.' });
    }

    // Ensure your .env file has JWT_SECRET defined
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).send({ error: 'Authentication failed. User not found.' });
    }

    // Remove the blocked user check - let them login but we'll handle transactions separately
    req.user = user; 
    
    next();
  } catch (err) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

export default auth;