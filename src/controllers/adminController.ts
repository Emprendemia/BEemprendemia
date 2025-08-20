import { Request, Response } from 'express';
import { User } from '../models/User';


export const getUsersByRole = async (req: Request, res: Response) => {
  const actor = req.user!;
  const includeAdmin = String(req.query.includeAdmin) === 'true';

  const baseRoles: string[] = ['user', 'teacher'];
  const roles = (actor.role === 'owner' && includeAdmin)
    ? [...baseRoles, 'admin']
    : baseRoles;

  const users = await User.find({ role: { $in: roles } })
    .select('_id fullname email role')
    .sort({ role: 1, fullname: 1 });

  res.json(users);
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { newRole } = req.body as { newRole: 'user'|'teacher'|'admin'|'owner' };
  const actor = req.user!;

  if (!['user','teacher','admin'].includes(newRole)) {
    return res.status(400).json({ message: 'Rol inválido' });
  }

  const target = await User.findById(userId).select('_id role');
  if (!target) return res.status(404).json({ message: 'Usuario no encontrado' });

  if (target.role === 'owner' || newRole === 'owner') {
    return res.status(403).json({ message: 'No se permite modificar el rol owner' });
  }

  if (actor.role === 'admin') {
    const allowed = ['user', 'teacher'];
    if (!allowed.includes(target.role) || !allowed.includes(newRole)) {
      return res.status(403).json({ message: 'Permisos insuficientes' });
    }
  }

  const updated = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true })
    .select('_id fullname email role');

  res.json({ message: 'Rol actualizado', user: updated });
};