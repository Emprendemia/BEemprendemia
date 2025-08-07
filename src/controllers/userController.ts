import { Request, Response } from 'express';
import { User } from '../models/User';
import { Course } from '../models/Course';

export const updateRecentCourse = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { courseId, progress, lastTimestamp } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const existingIndex = user.recentCourses.findIndex((entry: any) =>
      entry.course?.toString() === courseId
    );

    if (existingIndex !== -1) {
      user.recentCourses[existingIndex].progress = progress;
      user.recentCourses[existingIndex].lastTimestamp = lastTimestamp;
      const updated = user.recentCourses.splice(existingIndex, 1)[0];
      user.recentCourses.unshift(updated);
    } else {
      user.recentCourses.unshift({ course: courseId, progress, lastTimestamp });
    }

    user.recentCourses = user.recentCourses.slice(0, 5);

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ message: 'Progreso actualizado correctamente' });
  } catch (err) {
    console.error('❌ Error al actualizar curso visto:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const removeRecentCourse = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { courseId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    user.recentCourses = user.recentCourses.filter(
      (item) => item.course?.toString() !== courseId
    );
    await user.save();
    res.status(200).json(user.recentCourses);
  } catch {
    res.status(500).json({ message: 'Error al eliminar curso' });
  }
};

export const getRecentCourses = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.id).populate('recentCourses.course');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.status(200).json(user.recentCourses);
  } catch (error) {
    console.error('Error al obtener cursos recientes:', error);
    res.status(500).json({ message: 'Error interno' });
  }
};