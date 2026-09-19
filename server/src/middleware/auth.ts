import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../types';
import '../types';
const secret = process.env.JWT_SECRET || 'rently-local-development-only-secret';
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Please log in to continue.' });
  try { req.user = jwt.verify(token, secret) as { id: string; role: Role; email: string }; next(); }
  catch { return res.status(401).json({ message: 'Your session has expired. Please log in again.' }); }
}
export function authorize(...roles: Role[]) { return (req: Request, res: Response, next: NextFunction) => !req.user || !roles.includes(req.user.role) ? res.status(403).json({ message: 'You do not have access to this resource.' }) : next(); }
export const signToken = (payload: { id: string; role: Role; email: string }) => jwt.sign(payload, secret, { expiresIn: '7d' });
