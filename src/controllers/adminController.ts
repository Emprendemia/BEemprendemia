import { Request, Response } from 'express';
import { User } from '../models/User';

export const getUsersByRole = async (req: Request, res: Response) => {
  const users = await User.find({ role: { $in: ['user', 'teacher'] } }).select('_id fullname email role');
  res.json(users);
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { newRole } = req.body;

  if (!['user', 'teacher'].includes(newRole)) {
    return res.status(400).json({ message: 'Rol inválido' });
  }

  const user = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true });

  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

  res.json({ message: 'Rol actualizado', user });
};
