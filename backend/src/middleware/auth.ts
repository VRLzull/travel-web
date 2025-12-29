import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IAuthRequest, IUser, IAdminUser, UserRole } from '../types/user';
import { pool } from '../config/db';
import { env } from '../config/env';

const JWT_SECRET = env.jwtSecret;
type UserType = 'user' | 'admin';

const getUserFromDatabase = async (id: number, type: UserType): Promise<IUser | IAdminUser | null> => {
  try {
    if (type === 'admin') {
      const [rows] = await pool.query('SELECT * FROM admin_users WHERE id = ?', [id]);
      return (rows as IAdminUser[])[0] || null;
    } else {
      const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
      return (rows as IUser[])[0] || null;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const authenticate = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authorization header, authorization denied' 
      });
    }

    // Extract token (support both "Bearer TOKEN" and just "TOKEN")
    let token: string;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '').trim();
    } else {
      token = authHeader.trim();
    }
    
    if (!token || token === '') {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided, authorization denied' 
      });
    }

    // Verify token
    let decoded: { id: number; type: UserType; role?: UserRole };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { 
        id: number; 
        type: UserType;
        role?: UserRole;
      };
    } catch (jwtError: any) {
      console.error('JWT Verification Error:', {
        name: jwtError.name,
        message: jwtError.message,
        tokenPreview: token.substring(0, 20) + '...'
      });
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token has expired' 
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token format' 
        });
      }
      
      return res.status(401).json({ 
        success: false, 
        message: 'Token verification failed' 
      });
    }

    // Get user from database
    const user = await getUserFromDatabase(decoded.id, decoded.type);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Add role to request
    const role = 'role' in user ? (user.role as string) : 'user';
    
    req.user = user;
    req.role = role.toUpperCase() as any;
    next();
  } catch (error: any) {
    console.error('Authentication error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(401).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

export const optionalAuthenticate = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return next();
    }

    let token: string;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '').trim();
    } else {
      token = authHeader.trim();
    }
    
    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { 
        id: number; 
        type: UserType;
        role?: UserRole;
      };

      const user = await getUserFromDatabase(decoded.id, decoded.type);
      if (user) {
        req.user = user;
        req.role = 'role' in user ? (user.role as string) : 'user';
      }
    } catch (error) {
      // Ignore token verification errors in optional authentication
      console.log('Optional authentication failed, proceeding as guest');
    }
    
    next();
  } catch (error) {
    console.error('Error in optionalAuthenticate middleware:', error);
    next();
  }
};

export const authorize = (...roles: string[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction) => {
    if (!req.role) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    // Normalize role to uppercase for comparison
    const userRole = req.role.toUpperCase() as UserRole;
    const allowedRoles = roles.map(r => r.toUpperCase() as UserRole);

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role ${req.role} is not authorized to access this route. Required roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};
