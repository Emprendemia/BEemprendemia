import { Request, Response } from 'express';
import { Course } from '../models/Course';

type Role = 'user' | 'teacher' | 'admin' | 'owner';
const isAdminLike = (role?: Role) => role === 'admin' || role === 'owner';

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const { category } = req.query as { category?: string };
    const filter = category
      ? { category: { $regex: new RegExp(`^${category}$`, 'i') } }
      : {};
    const courses = await Course.find(filter);
    res.json(courses);
  } catch {
    res.status(500).json({ message: 'Error al obtener cursos' });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).user?.id;
    const { title, description, modules, hours, image, videoUrl, category } = req.body;

    const course = new Course({
      title,
      description,
      modules,
      hours,
      image,
      videoUrl,
      category,
      teacher: teacherId,
      state: 'in_review'
    });

    await course.save();
    res.status(201).json({ message: 'Curso creado', course });
  } catch {
    res.status(500).json({ message: 'Error al crear el curso' });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const user = (req as any).user as { id: string; role: Role };
    const updateData = { ...req.body };

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Curso no encontrado' });

    if (!isAdminLike(user.role)) {
      if (!course.teacher || String(course.teacher) !== user.id) {
        return res.status(403).json({ message: 'No autorizado' });
      }
      delete (updateData as any).state;
    }

    Object.assign(course, updateData);
    await course.save();

    res.json({ message: 'Curso actualizado', course });
  } catch {
    res.status(500).json({ message: 'Error al actualizar el curso' });
  }
};

export const updateCourseState = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { id: string; role: Role };
    if (!isAdminLike(user.role)) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const { courseId } = req.params;
    const { state } = req.body as { state: 'draft' | 'in_review' | 'published' | 'inactive' };

    if (!['draft', 'in_review', 'published', 'inactive'].includes(state)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const updated = await Course.findByIdAndUpdate(courseId, { state }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Curso no encontrado' });

    res.json({ message: 'Estado actualizado', course: updated });
  } catch {
    res.status(500).json({ message: 'Error al cambiar estado del curso' });
  }
};

export const getMyCourses = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { id: string; role: Role };
    if (!['teacher', 'admin', 'owner'].includes(user.role)) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    const courses = await Course.find({ teacher: user.id });
    res.json(courses);
  } catch {
    res.status(500).json({ message: 'Error al obtener tus cursos' });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Curso no encontrado' });
    res.json(course);
  } catch {
    res.status(500).json({ message: 'Error al obtener el curso' });
  }
};

export const getCoursesByTeacherId = async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.params;
    const courses = await Course.find({ teacher: teacherId });
    res.json(courses);
  } catch {
    res.status(500).json({ message: 'Error al obtener cursos del profesor' });
  }
};

export const bulkSetTeacherCoursesState = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { id: string; role: Role };
    if (!isAdminLike(user.role)) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const { teacherId } = req.params;
    const { state } = req.body as { state: 'inactive' | 'in_review' | 'published' };

    if (!['inactive', 'in_review', 'published'].includes(state)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const result: any = await Course.updateMany(
      { teacher: teacherId },
      { $set: { state } }
    );

    const matched = result?.matchedCount ?? result?.n ?? 0;
    const modified = result?.modifiedCount ?? result?.nModified ?? 0;

    res.json({ message: 'Cursos actualizados', matched, modified });
  } catch {
    res.status(500).json({ message: 'Error al actualizar cursos' });
  }
};
