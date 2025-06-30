// src/@types/express.d.ts

import { IUser } from '../models/User';

// This block of code merges a new property 'user' into the existing
// Express 'Request' interface.
declare global {
  namespace Express {
    export interface Request {
      
      user?: IUser;
    }
  }
}

// This line is needed to make the file a module.
export {};