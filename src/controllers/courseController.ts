import { Request, Response } from 'express';
import { Course } from '../models/Course';

export const getAllCourses = async (req: Request, res: Response) => {
  const { category } = req.query;
  const filter = category
    ? { category: { $regex: new RegExp(`^${category}$`, 'i') } }
    : {};

  const courses = await Course.find(filter);
  res.json(courses);
};

export const createCourse = async (req: Request, res: Response) => {
  const teacherId = (req as any).user.id;
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
};

export const updateCourse = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const user = (req as any).user;
  const updateData = req.body;

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: 'Curso no encontrado' });

  if (user.role !== 'admin' && course.teacher.toString() !== user.id) {
    return res.status(403).json({ message: 'No autorizado' });
  }

  // evitar que el profesor edite el estado directamente
  if (user.role !== 'admin') {
    delete updateData.state;
  }

  Object.assign(course, updateData);
  await course.save();

  res.json({ message: 'Curso actualizado', course });
};

export const updateCourseState = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { state } = req.body;

  if (!['draft', 'in_review', 'published', 'inactive'].includes(state)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  const updated = await Course.findByIdAndUpdate(courseId, { state }, { new: true });
  if (!updated) return res.status(404).json({ message: 'Curso no encontrado' });

  res.json({ message: 'Estado actualizado', course: updated });
};

export const getMyCourses = async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!['teacher', 'admin'].includes(user.role)) {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  const courses = await Course.find({ teacher: user.id });
  res.json(courses);
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
  const { teacherId } = req.params;

  try {
    const courses = await Course.find({ teacher: teacherId });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener cursos del profesor' });
  }
};

