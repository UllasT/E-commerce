import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db/sql/index.js';
import User from '../models/users.schema.js';
import { DATABASE_TYPE, JWT_SECRET } from '../config/db.js';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email?: string };
    }
  }
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = (req.headers.authorization || req.headers.Authorization) as
      | string
      | undefined;

    if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    if (!token) return res.status(401).json({ message: 'Token missing' });

    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET || process.env.JWT_SECRET!) as any;
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const userId = payload?.userId || payload?.id || payload?.sub;
    if (!userId) return res.status(401).json({ message: 'Token payload missing user id' });

    if (DATABASE_TYPE === 'sql') {
      const result: any = await pool.execute('SELECT id, email FROM users WHERE id = ? AND refresh_token = ?', [
        userId,
        token,
      ]);
      const rows = result[0];
      if (!rows || rows.length === 0) {
        return res.status(401).json({ message: 'User not found or token mismatch' });
      }
      req.user = { id: rows[0].id, email: rows[0].email };
    } else if (DATABASE_TYPE === 'mongodb') {
      const user = await User.findOne({ _id: userId, refresh_token: token }).select('_id email').lean();
      if (!user) return res.status(401).json({ message: 'User not found or token mismatch' });
      req.user = { id: String(user._id), email: user.email };
    } else {
      return res.status(500).json({ message: 'Unknown DATABASE_TYPE configuration' });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default authMiddleware;
