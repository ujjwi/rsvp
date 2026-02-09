import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const fetchUser = (req: Request, res: Response, next: NextFunction): void | Response => {
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const data = jwt.verify(token, process.env.secret_key!) as { user: { _id: string } };
    req.user = { _id: data.user._id as any };
    next();
  } catch {
    return res.status(401).json({ error: 'Authentication failed.' });
  }
};

export default fetchUser;
