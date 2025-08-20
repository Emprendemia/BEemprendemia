import { Request, Response } from 'express';
import { User } from '../models/User';

/**
 * GET /users?includeAdmin=true|false
 * - admin: devuelve user+teacher (ignora includeAdmin)
 * - owner: si includeAdmin=true, agrega admin
 */
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

/**
 * PUT /users/:userId/role
 * - admin: solo puede user <-> teacher
 * - owner: puede setear user/teacher/admin
 * - nadie puede tocar a un owner, ni convertir a/desde owner
 */
export const updateUserRole = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { newRole } = req.body as { newRole: 'user'|'teacher'|'admin'|'owner' };
  const actor = req.user!;

  // Valid roles que se pueden asignar vía API
  if (!['user','teacher','admin'].includes(newRole)) {
    return res.status(400).json({ message: 'Rol inválido' });
  }

  const target = await User.findById(userId).select('_id role');
  if (!target) return res.status(404).json({ message: 'Usuario no encontrado' });

  // Proteger owner
  if (target.role === 'owner' || newRole === 'owner') {
    return res.status(403).json({ message: 'No se permite modificar el rol owner' });
  }

  // Admin con permisos limitados
  if (actor.role === 'admin') {
    const allowed = ['user', 'teacher'];
    if (!allowed.includes(target.role) || !allowed.includes(newRole)) {
      return res.status(403).json({ message: 'Permisos insuficientes' });
    }
  }

  // Owner puede asignar admin/user/teacher
  const updated = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true })
    .select('_id fullname email role');

  res.json({ message: 'Rol actualizado', user: updated });
};