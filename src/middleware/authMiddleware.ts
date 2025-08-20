import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto';

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      role: 'user' | 'teacher' | 'admin' | 'owner';
    }
    interface Request {
      user?: UserPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : '';
  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as Express.UserPayload;
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    return res.status(403).json({ message: 'Token inválido' });
  }
};

export const authorizeRoles = (...roles: Array<'admin' | 'owner'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !roles.includes(user.role as any)) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    next();
  };
};